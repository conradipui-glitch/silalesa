# R1: карта покрытия 22 основных маршрутов

Дата: 19.09.2026. Редакционная работа R1 затрагивает только P01 и общий шаблон. Тест общего шаблона остальных 19 SEO-маршрутов **не означает**, что их редакционные итерации завершены.

Этапы: 1 срез; 2 UX-диагноз; 3 факты; 4 текст; 5 CTA; 6 SEO/prerender; 7 тест/PR/Pages; 8 отчёт. «Смоук» = только регрессия общего шаблона, «—» = будущая итерация.

| URL | Блок | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| / | R8 | — | — | — | — | — | — | — | — |
| /services/ | R4 | — | — | — | — | — | смоук | смоук | — |
| /banya-kvadro-2x2-omsk/ | R7 | — | — | — | — | — | смоук | смоук | — |
| /banya-kvadro-3x2-omsk/ | R7 | — | — | — | — | — | смоук | смоук | — |
| /banya-kvadro-4x2-omsk/ | R7 | — | — | — | — | — | смоук | смоук | — |
| /karkasnaya-banya-omsk/ | R7 | — | — | — | — | — | смоук | смоук | — |
| /mobilnaya-banya-omsk/ | R7 | — | — | — | — | — | смоук | смоук | — |
| /polusuhaya-styazhka-omsk/ | R4 | — | — | — | — | — | смоук | смоук | — |
| /mehanizirovannaya-shtukaturka-omsk/ | R4 | — | — | — | — | — | смоук | смоук | — |
| /burenie-skvazhiny-omsk/ | R4 | — | — | — | — | — | смоук | смоук | — |
| /guides/bani/fundament-dlya-mobilnoy-bani/ | R6 | — | — | — | — | — | смоук | смоук | — |
| /guides/bani/kvadro-ili-karkasnaya/ | R5 | — | — | — | — | — | смоук | смоук | — |
| /guides/bani/chto-vhodit-v-tsenu/ | R5 | — | — | — | — | — | смоук | смоук | — |
| /guides/bani/kak-vybrat-razmer-2x2-3x2-4x2/ | R5 | — | — | — | — | — | смоук | смоук | — |
| /guides/bani/gotovaya-ili-stroit/ | R5 | — | — | — | — | — | смоук | смоук | — |
| /guides/bani/podgotovka-uchastka-dostavka-manipulyator/ | R6 | — | — | — | — | — | смоук | смоук | — |
| /guides/bani/chek-list-priemki-gotovoy-bani/ | R6 | — | — | — | — | — | смоук | смоук | — |
| /guides/uchastok/kogda-burit-skvazhinu/ | R6 | — | — | — | — | — | смоук | смоук | — |
| /guides/remont/shtukaturka-ili-styazhka-chto-snachala/ | R3 | — | — | — | — | — | смоук | смоук | — |
| /guides/remont/polusuhaya-ili-mokraya-styazhka/ | R3 | — | — | — | — | — | смоук | смоук | — |
| /guides/remont/mehanizirovannaya-ili-ruchnaya-shtukaturka/ | R1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PR/Pages | отчёт |
| /guides/remont/gipsovaya-ili-tsementnaya-shtukaturka/ | R3 | — | — | — | — | — | смоук | смоук | — |

Дополнительные поверхности: общий header/footer — R8/R10; legacy /product/:id, печать, 404, JS/без JS и мобильные состояния — R10. Интерактив P01 (карта этапов и матрица смет) — R2, в R1 не изменён.

## Проверки и граница приёмки R1

PR #16: изолированный Action выполнил `npm ci`, `npx tsc --noEmit`, `GITHUB_PAGES=true npm run build`, `node scripts/check-r1.mjs`, `git diff --check` успешно. Штатный CI первой версии PR также успешен. Проверка `check-r1.mjs` проходит по 20 SEO HTML и главной/услугам в sitemap, сверяет четыре тезиса и шесть строк таблицы, 8 разделов/FAQ, CTA и действующий номер из конфигурации, canonical, schema и HTML без JS; остальные 19 страниц не теряют свой блок `points`.

Визуальное отображение в реальном браузере и кликабельность WhatsApp на физическом устройстве отдельно не подтверждены. Финальный статус CI после этого документа, SHA merge и GitHub Pages build/deploy нужно записать в итоговом отчёте по факту, не заранее.
