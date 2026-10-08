#!/usr/bin/env node
/**
 * Compile manually checked Yandex Wordstat monthly counts for Omsk oblast.
 * Required input: month,service,queries,region,phrase.
 * Usage:
 *   node scripts/compile-seasonal-demand.mjs path/to/reviewed.csv --evidence-ref=wordstat-export-2026-10
 * The command never updates the live site unless an operator explicitly runs it.
 * Activation requires a separate GitHub PR review of the input and evidence.
 */
import fs from "node:fs/promises";
import path from "node:path";

const SERVICES = [
  "cottages","monolith","masonry","plaster","screed","concrete-screed","topping",
  "metalworks","hangars","multistory","buildings","demolition","roofing","facades",
];
const REGION = "Омская область";
const USAGE = "Usage: node scripts/compile-seasonal-demand.mjs reviewed.csv --evidence-ref=<documented-Wordstat-export-id>";

function fail(message) { throw new Error(message); }

// Small CSV parser supporting quoted fields, double quotes and CRLF. No external dependency.
function parseCsv(input) {
  const rows = [];
  let row = [], value = "", quoted = false;
  for(let i=0;i<input.length;i++){
    const char=input[i];
    if(char === '"'){
      if(quoted && input[i+1]==='"') { value+='"'; i++; }
      else quoted=!quoted;
    } else if(char===',' && !quoted) {row.push(value);value="";}
    else if((char==='\n'||char==='\r')&&!quoted){
      if(char==='\r'&&input[i+1]==='\n')i++;
      row.push(value); value="";
      if(row.some(Boolean))rows.push(row);
      row=[];
    } else value+=char;
  }
  if(quoted) fail("Unterminated quoted CSV field");
  row.push(value);
  if(row.some(Boolean))rows.push(row);
  return rows;
}

function compile(input, evidenceRef, now=new Date()) {
  if(!evidenceRef || !/^[a-zA-Z0-9._-]{8,100}$/.test(evidenceRef))fail("Evidence reference is required");
  const [header,...records]=parseCsv(input.trim());
  if(!header || header.join(",")!=="month,service,queries,region,phrase")fail("Expected exact columns: month,service,queries,region,phrase");

  const counts=new Map(),phrases=new Map(),years=new Set();
  for(const [index,record] of records.entries()){
    if(record.length!==5)fail(`Invalid column count in row ${index+2}`);
    const [month,service,raw,region,phrase]=record.map(x=>x.trim());
    if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))fail(`Invalid month at row ${index+2}: ${month}`);
    if(!SERVICES.includes(service))fail(`Unknown service at row ${index+2}: ${service}`);
    if(region!==REGION)fail(`Expected ${REGION}, got ${region}`);
    if(!/^\d+$/.test(raw)||!Number.isSafeInteger(Number(raw)))fail(`Invalid queries at row ${index+2}`);
    if(phrase.length<3)fail(`Missing keyword phrase in row ${index+2}`);
    const old=phrases.get(service);
    if(old&&old!==phrase)fail(`Keyword phrase for ${service} differs between months; review semantic grouping first`);
    phrases.set(service,phrase);
    const year=Number(month.slice(0,4));
    if(year>=now.getUTCFullYear())fail(`Incomplete current/future year ${year} is not used for annual baseline`);
    years.add(year);
    const key=`${month}/${service}`;
    if(counts.has(key))fail(`Duplicate month/service pair: ${key}`);
    counts.set(key,Number(raw));
  }
  const completeYears=[...years].sort((a,b)=>b-a).filter(year=>SERVICES.every(service=>
    Array.from({length:12},(_,i)=>counts.has(`${year}-${String(i+1).padStart(2,"0")}/${service}`)).every(Boolean)
  ));
  if(completeYears.length<2)fail("Need at least two completed years with all 12 months and all 14 services");
  const selectedYears=completeYears.slice(0,2).sort();
  const leaders={},confidence={};
  for(let month=1;month<=12;month++){
    const key=String(month).padStart(2,"0");
    const rows=SERVICES.map(service=>({
      service,average:selectedYears.reduce((sum,year)=>sum+counts.get(`${year}-${key}/${service}`),0)/selectedYears.length
    })).sort((a,b)=>b.average-a.average);
    const [first,second]=rows;
    // Close demand (<20% spread) means mixed offer, not a forced fictional winner.
    if(first.average>=20 && first.average>=second.average*1.2 && first.average!==second.average){
      leaders[key]=first.service;
      confidence[key]={topAverage:first.average,secondAverage:second.average};
    }
  }
  return {
    version:1,region:REGION,verified:true,source:"Yandex Wordstat",
    period:`${selectedYears[0]}–${selectedYears[1]}`,
    evidenceRef,computedAt:now.toISOString().slice(0,10),
    leaderByMonth:leaders,
    note:"Two complete calendar years, consistent one phrase per service; 20% leader margin. Months without a clear leader use neutral general offer.",
    confidence
  };
}

const [inputFile,...args]=process.argv.slice(2);
if(!inputFile||!args.some(x=>x.startsWith("--evidence-ref=")))fail(USAGE);
const evidenceRef=args.find(x=>x.startsWith("--evidence-ref=")).slice("--evidence-ref=".length);
const outputFile=path.resolve("src/data/seasonal-demand.json");
const config=compile(await fs.readFile(inputFile,"utf8"),evidenceRef);
if(args.includes("--dry-run")){
  process.stdout.write(JSON.stringify(config,null,2)+"\n");
}else{
  await fs.writeFile(outputFile,JSON.stringify(config,null,2)+"\n");
  console.log("Compiled verified seasonal leaders:",Object.entries(config.leaderByMonth).length,"months, period",config.period);
  console.log("Review the source CSV and resulting JSON in a PR before deployment.");
}
