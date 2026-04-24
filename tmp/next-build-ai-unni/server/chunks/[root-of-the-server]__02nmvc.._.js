module.exports=[93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},12117,e=>{"use strict";async function t(e){let t=process.env.TOSS_SECRET_KEY;if(!t)throw Error("TOSS_SECRET_KEY is not set");let r=Buffer.from(t+":").toString("base64"),a=await fetch("https://api.tosspayments.com/v1/payments/confirm",{method:"POST",headers:{Authorization:`Basic ${r}`,"Content-Type":"application/json"},body:JSON.stringify(e)}),n=await a.json();if(!a.ok)throw Error(`Toss confirm failed [${a.status}]: ${n.code||"UNKNOWN"} - ${n.message||"no message"}`);return n}e.s(["confirmTossPayment",0,t])},32381,e=>{"use strict";var t=e.i(47909),r=e.i(74017),a=e.i(96250),n=e.i(59756),s=e.i(61916),o=e.i(74677),i=e.i(69741),l=e.i(16795),u=e.i(87718),d=e.i(95169),p=e.i(47587),c=e.i(66012),m=e.i(70101),h=e.i(26937),f=e.i(10372),x=e.i(93695);e.i(52474);var g=e.i(220),y=e.i(44070),R=e.i(12117);let _=`[절대 규칙 - 반드시 지킬 것]
1. 어떤 경우에도 반드시 JSON 형식으로만 응답할 것. JSON 외의 텍스트/설명/질문 절대 금지.
2. 입력 정보가 부족해도 반문 금지. 주어진 맥락만으로 최선의 예측을 해서 JSON 생성.
3. 상대 심리\xb7애착 스타일\xb7관계 단계에 근거해 예측할 것 (추측 아닌 심리학적 추론).

너는 연애 경험 많고 눈치 빠른 친한 언니 "AI언니"야. 사용자가 쓴 답장 초안이 상대방한테 어떻게 먹힐지 시뮬레이션해줘.

존 가트만의 관계 심리학(긍정:부정 상호작용 비율 5:1, 전환 시도 Bids for Connection 반응, 4가지 위험 신호: 비난\xb7방어\xb7경멸\xb7담쌓기, Repair Attempts)과 애착이론(안정형/불안형/회피형 반응 패턴)을 근거로 분석할 것.

말투: 20대~30대 여성 친구한테 편하게 반말. 직설적이되 따뜻하게. 애매하게 말하지 말고 솔직하게.

[예측할 항목]
1. predicted_reaction (2~3문장):
   - 상대방이 실제로 답할 법한 톤\xb7내용을 구체적으로. "~라고 답할 것 같아" 형태로.
   - 상대 애착 스타일(안정/불안/회피)\xb7관계 단계를 반영.

2. emotional_shift:
   - 현재 온도 → 예상 변화 온도. 예: "미지근→따뜻", "따뜻→차가움", "호감→경계", "안정→균열"
   - 현재 상태 정확히 반영 후 변화만 표기.

3. risk_level: "낮음" / "중간" / "높음"
   - 상대가 부담\xb7거리감\xb7불쾌감 느낄 확률.
   - "낮음": 관계에 긍정적, 부담 없음
   - "중간": 상대 성향 따라 갈릴 수 있음
   - "높음": 부담감\xb7경계\xb7오해 유발 가능

4. why (2~3문장):
   - 왜 그렇게 반응할지 심리학 근거로 설명.
   - 가트만 4 Horsemen 출현 여부\xb7Bids for Connection 여부\xb7애착 반응 패턴 인용.
   - 구체적 문구 짚어주기.

5. better_version (3~5문장):
   - 사용자 답안의 의도\xb7톤은 유지하면서 리스크 낮춘 개선 버전.
   - 사용자가 그대로 복사해서 쓸 수 있는 실사용 멘트.
   - 자연스러운 대화체로.

6. one_liner (20자 이내):
   - 친한 언니가 등 쿡 찌르듯 한 문장. 이모지\xb7따옴표 금지.
   - 답안의 핵심 문제/장점을 팩폭.

JSON만 응답:
{"predicted_reaction":"...","emotional_shift":"미지근→따뜻","risk_level":"중간","why":"...","better_version":"...","one_liner":"..."}`;async function v(e,t,r,a){let n=process.env.ANTHROPIC_API_KEY;if(!n)throw Error("ANTHROPIC_API_KEY missing");let s=[];if(Array.isArray(r))for(let e of r)s.push({type:"image",source:{type:"base64",media_type:e.mediaType||"image/jpeg",data:e.data}});let o=_;o+=`

[기존 대화 맥락(사용자가 설명한 상황)]
${t?.trim()||"(사용자가 별도 설명하지 않음)"}`,o+=`

[이미 분석된 관계 상태 - 이 맥락으로 시뮬레이션할 것]`,void 0!==e.score&&(o+=`
- 현재 호감도: ${e.score}점`),e.temperature&&(o+=`
- 현재 감정 온도: ${e.temperature}`),e.stage&&(o+=`
- 관계 단계: ${e.stage}`),e.summary&&(o+=`
- 언니 한마디: "${e.summary}"`),e.diagnosis&&(o+=`
- 진단: ${e.diagnosis}`),e.psychology&&(o+=`
- 상대 심리: ${e.psychology}`),r&&r.length>0&&(o+=`

(위 첨부 이미지는 기존 대화 캡처. 대화 톤\xb7리듬\xb7텀 파악 시 참고.)`),o+=`

[사용자가 보내려고 쓴 답장 초안]
"${a}"`,o+=`

이 답장을 실제로 보냈을 때 상대방이 어떻게 반응할지 심리학적으로 시뮬레이션해줘.`,s.push({type:"text",text:o});let i=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":n,"anthropic-version":"2023-06-01"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1500,temperature:.3,messages:[{role:"user",content:s}]})});if(!i.ok){let e=await i.text();throw Error(`Claude API ${i.status}: ${e.substring(0,200)}`)}let l=await i.json(),u=(l?.content?.[0]?.text||"").match(/\{[\s\S]*\}/);if(!u)throw Error("시뮬 결과 JSON 파싱 실패");return JSON.parse(u[0])}async function w(e){try{let{paymentKey:t,sim_order_id:r,amount:a}=await e.json();if(!t||!r||"number"!=typeof a)return Response.json({error:"paymentKey, sim_order_id, amount가 필요해요"},{status:400});let n=(0,y.getSupabaseAdmin)(),{data:s,error:o}=await n.from("simulations").select("*").eq("sim_order_id",r).single();if(o||!s)return Response.json({error:"시뮬 주문을 찾을 수 없어요"},{status:404});if(s.amount!==a)return Response.json({error:"결제 금액이 주문 금액과 달라요"},{status:400});if("completed"===s.status&&s.result)return Response.json({sim_order_id:r,draft_reply:s.draft_reply,result:s.result});"paid"!==s.status&&"completed"!==s.status&&(await (0,R.confirmTossPayment)({paymentKey:t,orderId:r,amount:a}),await n.from("simulations").update({status:"paid",payment_key:t,paid_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("sim_order_id",r));let{data:i,error:l}=await n.from("orders").select("analysis_result, input_text, input_images").eq("order_id",s.parent_order_id).single();if(l||!i?.analysis_result)return Response.json({error:"원 분석 데이터를 불러오지 못했어요"},{status:500});let u=await v(i.analysis_result,i.input_text,i.input_images,s.draft_reply);return await n.from("simulations").update({status:"completed",result:u,updated_at:new Date().toISOString()}).eq("sim_order_id",r),Response.json({sim_order_id:r,draft_reply:s.draft_reply,result:u})}catch(e){return console.error("simulation/confirm error:",e),Response.json({error:"시뮬레이션 중 오류",debug:e?.message||String(e)},{status:500})}}e.s(["POST",0,w],12303);var b=e.i(12303);let E=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/simulation/confirm/route",pathname:"/api/simulation/confirm",filename:"route",bundlePath:""},distDir:"/tmp/next-build-ai-unni",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/simulation/confirm/route.ts",nextConfigOutput:"",userland:b,...{}}),{workAsyncStorage:S,workUnitAsyncStorage:C,serverHooks:A}=E;async function O(e,t,a){a.requestMeta&&(0,n.setRequestMeta)(e,a.requestMeta),E.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let y="/api/simulation/confirm/route";y=y.replace(/\/index$/,"")||"/";let R=await E.prepare(e,t,{srcPage:y,multiZoneDraftMode:!1});if(!R)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:_,params:v,nextConfig:w,parsedUrl:b,isDraftMode:S,prerenderManifest:C,routerServerContext:A,isOnDemandRevalidate:O,revalidateOnlyGenerated:T,resolvedPathname:N,clientReferenceManifest:P,serverActionsManifest:j}=R,q=(0,i.normalizeAppPath)(y),k=!!(C.dynamicRoutes[q]||C.routes[N]),I=async()=>((null==A?void 0:A.render404)?await A.render404(e,t,b,!1):t.end("This page could not be found"),null);if(k&&!S){let e=!!C.routes[N],t=C.dynamicRoutes[q];if(t&&!1===t.fallback&&!e){if(w.adapterPath)return await I();throw new x.NoFallbackError}}let $=null;!k||E.isDev||S||($="/index"===($=N)?"/":$);let H=!0===E.isDev||!k,U=k&&!H;j&&P&&(0,o.setManifestsSingleton)({page:y,clientReferenceManifest:P,serverActionsManifest:j});let D=e.method||"GET",M=(0,s.getTracer)(),K=M.getActiveScopeSpan(),B=!!(null==A?void 0:A.isWrappedByNextServer),F=!!(0,n.getRequestMeta)(e,"minimalMode"),J=(0,n.getRequestMeta)(e,"incrementalCache")||await E.getIncrementalCache(e,w,C,F);null==J||J.resetRequestCache(),globalThis.__incrementalCache=J;let L={params:v,previewProps:C.preview,renderOpts:{experimental:{authInterrupts:!!w.experimental.authInterrupts},cacheComponents:!!w.cacheComponents,supportsDynamicResponse:H,incrementalCache:J,cacheLifeProfiles:w.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a,n)=>E.onRequestError(e,t,a,n,A)},sharedContext:{buildId:_}},W=new l.NodeNextRequest(e),Y=new l.NodeNextResponse(t),G=u.NextRequestAdapter.fromNodeNextRequest(W,(0,u.signalFromNodeResponse)(t));try{let n,o=async e=>E.handle(G,L).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=M.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==d.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route");if(a){let t=`${D} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t),n&&n!==e&&(n.setAttribute("http.route",a),n.updateName(t))}else e.updateName(`${D} ${y}`)}),i=async n=>{var s,i;let l=async({previousCacheEntry:r})=>{try{if(!F&&O&&T&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let s=await o(n);e.fetchMetrics=L.renderOpts.fetchMetrics;let i=L.renderOpts.pendingWaitUntil;i&&a.waitUntil&&(a.waitUntil(i),i=void 0);let l=L.renderOpts.collectedTags;if(!k)return await (0,c.sendResponse)(W,Y,s,L.renderOpts.pendingWaitUntil),null;{let e=await s.blob(),t=(0,m.toNodeOutgoingHttpHeaders)(s.headers);l&&(t[f.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==L.renderOpts.collectedRevalidate&&!(L.renderOpts.collectedRevalidate>=f.INFINITE_CACHE)&&L.renderOpts.collectedRevalidate,a=void 0===L.renderOpts.collectedExpire||L.renderOpts.collectedExpire>=f.INFINITE_CACHE?void 0:L.renderOpts.collectedExpire;return{value:{kind:g.CachedRouteKind.APP_ROUTE,status:s.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==r?void 0:r.isStale)&&await E.onRequestError(e,t,{routerKind:"App Router",routePath:y,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:U,isOnDemandRevalidate:O})},!1,A),t}},u=await E.handleResponse({req:e,nextConfig:w,cacheKey:$,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:C,isRoutePPREnabled:!1,isOnDemandRevalidate:O,revalidateOnlyGenerated:T,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:F});if(!k)return null;if((null==u||null==(s=u.value)?void 0:s.kind)!==g.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==u||null==(i=u.value)?void 0:i.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});F||t.setHeader("x-nextjs-cache",O?"REVALIDATED":u.isMiss?"MISS":u.isStale?"STALE":"HIT"),S&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let d=(0,m.fromNodeOutgoingHttpHeaders)(u.value.headers);return F&&k||d.delete(f.NEXT_CACHE_TAGS_HEADER),!u.cacheControl||t.getHeader("Cache-Control")||d.get("Cache-Control")||d.set("Cache-Control",(0,h.getCacheControlHeader)(u.cacheControl)),await (0,c.sendResponse)(W,Y,new Response(u.value.body,{headers:d,status:u.value.status||200})),null};B&&K?await i(K):(n=M.getActiveScopeSpan(),await M.withPropagatedContext(e.headers,()=>M.trace(d.BaseServerSpan.handleRequest,{spanName:`${D} ${y}`,kind:s.SpanKind.SERVER,attributes:{"http.method":D,"http.target":e.url}},i),void 0,!B))}catch(t){if(t instanceof x.NoFallbackError||await E.onRequestError(e,t,{routerKind:"App Router",routePath:q,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:U,isOnDemandRevalidate:O})},!1,A),k)throw t;return await (0,c.sendResponse)(W,Y,new Response(null,{status:500})),null}}e.s(["handler",0,O,"patchFetch",0,function(){return(0,a.patchFetch)({workAsyncStorage:S,workUnitAsyncStorage:C})},"routeModule",0,E,"serverHooks",0,A,"workAsyncStorage",0,S,"workUnitAsyncStorage",0,C],32381)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__02nmvc.._.js.map