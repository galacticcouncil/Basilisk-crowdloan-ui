(this["webpackJsonpBasilisk-crowdloan-ui"]=this["webpackJsonpBasilisk-crowdloan-ui"]||[]).push([[0],{279:function(e,n,a){},280:function(e,n,a){},291:function(e,n){},295:function(e,n){},296:function(e,n){},320:function(e,n,a){},321:function(e,n,a){},429:function(e,n,a){"use strict";a.r(n);var t,c=a(15),i=a.n(c),r=a(239),s=a.n(r),o=(a(279),a(280),a(462)),l=a(464),d=a(454),u={indexerUrl:"https://api-crowdloan-basilisk.hydradx.io/",nodeUrl:"wss://ksm-arch-01.hydration.cloud",dappName:"Basilisk Crowdloan",ownParachainId:function(){var e=new URL(document.location).searchParams;return console.log("ownParachainId",e.get("ownParachainId")),e.get("ownParachainId")}()||"2082-FcbeWvFfqsNj6D8F3gg45pHYRAAsFAdCApCnRUJ5TX71mPg",ownParaId:"2082",blockTime:6e3,ownCrowdloanBlockNum:8228873,targetAuctionId:5,ksmOpportunityCost:"0.1375",ksmPrecision:12,ksmToUsd:"205.20",hdxToUsd:"0.0859",incentives:{precision:50,hdx:{decimals:12,scale:{leadPercentageDiff:{min:0,max:.1},rewardMultiplier:{min:.3,max:.05}}},bsx:{decimals:12,allocated:"15000000000000000000000",scale:{rewardMultiplier:{min:1,max:0,none:0}}}},historicalAuctionData:{1:{blockNum:7924237,closingStart:7951237,closingEnd:8023773},2:{blockNum:8024552,closingStart:8051552,closingEnd:8123989},3:{blockNum:8124516,closingStart:8151516,closingEnd:8223516},4:{blockNum:8224581,closingStart:8251581,closingEnd:8323581},5:{blockNum:8324646,closingStart:8351646,closingEnd:8423646}}},b=a(13),j=new o.a({uri:u.indexerUrl,cache:new l.a,defaultOptions:{watchQuery:{fetchPolicy:"network-only"},query:{fetchPolicy:"network-only"}}}),h=function(e){var n=e.children;return Object(b.jsx)(d.a,{client:j,children:n})},x=a(1),m=a(26),g=a(163);!function(e){e.LoadChronicle="LOAD_CHRONICLE",e.SetChronicle="SET_CHRONICLE",e.LoadOwnData="LOAD_OWN_DATA",e.SetOwnData="SET_OWN_DATA",e.LoadSiblingData="LOAD_SIBLING_DATA",e.SetSiblingData="SET_SIBLING_DATA",e.ConnectAccount="CONNECT_ACCOUNT",e.SetAccountData="SET_ACCOUNT_DATA",e.LoadHistoricalIncentivesData="LOAD_HISTORICAL_INCENTIVES_DATA",e.SetHistoricalIncentivesData="SET_HISTORICAL_INCENTIVES_DATA"}(t||(t={}));var v,O,w,p,f,N,k,C,I=a(18),A=a.n(I),S={account:{loading:!1,data:{address:null,balance:"0",contributions:[]}},chronicle:{loading:!1,data:{curBlockNum:0,curAuctionId:0,curAuction:{closingStart:null,closingEnd:null,blockNum:null}}},own:{loading:!1,data:{crowdloan:null,aggregatedCrowdloanBalances:[]}},sibling:{loading:!1,data:{crowdloan:null,aggregatedCrowdloanBalances:[]}},historicalIncentives:{loading:!1,data:{}}},B=function(e,n){A.a.debug("Store","action",n.type,n.payload,e);var a=function(){switch(n.type){case t.LoadChronicle:return Object(m.a)(Object(m.a)({},e),{},{chronicle:Object(m.a)(Object(m.a)({},e.chronicle),{},{loading:!0})});case t.SetChronicle:return Object(m.a)(Object(m.a)({},e),{},{chronicle:Object(m.a)(Object(m.a)({},e.chronicle),{},{loading:!1,data:n.payload})});case t.LoadOwnData:return Object(m.a)(Object(m.a)({},e),{},{own:Object(m.a)(Object(m.a)({},e.own),{},{loading:!0})});case t.SetOwnData:return Object(m.a)(Object(m.a)({},e),{},{own:Object(m.a)(Object(m.a)({},e.own),{},{loading:!1,data:n.payload})});case t.LoadSiblingData:return Object(m.a)(Object(m.a)({},e),{},{sibling:Object(m.a)(Object(m.a)({},e.sibling),{},{loading:!0})});case t.SetSiblingData:return Object(m.a)(Object(m.a)({},e),{},{sibling:{loading:!1,data:n.payload}});case t.ConnectAccount:return Object(m.a)(Object(m.a)({},e),{},{account:Object(m.a)(Object(m.a)({},S.account),{},{loading:!0})});case t.SetAccountData:return Object(m.a)(Object(m.a)({},e),{},{account:Object(m.a)(Object(m.a)({},e.account),{},{loading:!1,data:n.payload})});case t.LoadHistoricalIncentivesData:return Object(m.a)(Object(m.a)({},e),{},{historicalIncentives:Object(m.a)(Object(m.a)({},e.historicalIncentives),{},{loading:!0})});case t.SetHistoricalIncentivesData:return Object(m.a)(Object(m.a)({},e),{},{historicalIncentives:Object(m.a)(Object(m.a)({},e.historicalIncentives),{},{loading:!1,data:n.payload})});default:return e}}();return A.a.debug("Store","newState",a),a},y=Object(g.a)((function(){var e=Object(c.useReducer)(B,S),n=Object(x.a)(e,2);return{state:n[0],dispatch:n[1]}})),E=Object(x.a)(y,2),R=E[0],T=E[1],D=function(){return T().state.chronicle},P=function(){return T().state.own},F=function(){return T().state.sibling},L=a(23),M=a.n(L),_=a(28),$=a(465),q=a(461),U=a(181),H=a(467),W=a(30),V=a.n(W),K=a(468),G=a(259),J={address:function(){var e=new URL(document.location).searchParams;return A.a.debug("account",e.get("account")),e.get("account")}()||""},Y=Object(g.a)((function(){var e=Object(c.useState)([]),n=Object(x.a)(e,2),a=n[0],t=n[1],i=Object(H.a)("bsx-crowdloan-account",J.address),r=Object(x.a)(i,2),s=r[0],o=r[1];s=s?Object(K.a)(Object(G.a)(s),2):"";var l=Object(c.useState)("0"),d=Object(x.a)(l,2),b=d[0],j=d[1],h=Object(c.useState)(!1),g=Object(x.a)(h,2),v=(g[0],g[1],Object(c.useState)(!1)),O=Object(x.a)(v,2),w=(O[0],O[1]),p=Object(c.useState)(void 0),f=Object(x.a)(p,2),N=f[0],k=f[1],C=Object(c.useState)(void 0),I=Object(x.a)(C,2),S=I[0],B=I[1],y=D();Object(c.useEffect)((function(){setTimeout(Object(_.a)(M.a.mark((function e(){var n,a,c,i;return M.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return A.a.debug("usePolkadot","loading initial"),w(!0),e.next=4,Object(U.b)(u.dappName);case 4:return n=e.sent,e.next=7,Object(U.a)();case 7:return a=e.sent.map((function(e){return Object(m.a)(Object(m.a)({},e),{},{address:Object(K.a)(Object(G.a)(e.address),2)})})),c=new $.a(u.nodeUrl),e.next=11,q.a.create({provider:c});case 11:i=e.sent,A.a.debug("usePolkadot","loaded",n,i),t(a),k(i),w(!1);case 16:case"end":return e.stop()}}),e)}))),300)}),[]);var E=function(){var e=Object(_.a)(M.a.mark((function e(){var n,a;return M.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(N&&s){e.next=2;break}return e.abrupt("return");case 2:return e.next=4,N.query.system.account(s);case 4:n=e.sent,a=n.data,A.a.debug("usePolkadot","balance",a.free.toString()),j(a.free.toString());case 8:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}();return Object(c.useEffect)((function(){s&&N&&E()}),[s,N,y.data.curBlockNum]),{accounts:a,setActiveAccount:o,activeAccount:s,activeAccountBalance:b,lastContributionStatus:S,contribute:function(){var e=Object(_.a)(M.a.mark((function e(n){var a;return M.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(N){e.next=2;break}return e.abrupt("return");case 2:if(s){e.next=4;break}return e.abrupt("return");case 4:return w(!0),e.next=7,Object(U.c)(s);case 7:a=e.sent,Object(_.a)(M.a.mark((function e(){return M.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:try{N.tx.crowdloan.contribute(u.ownParaId,new V.a(n).toFixed(0),null).signAndSend(s,{signer:a.signer},(function(e){var n=e.status,a=e.events;(n.isInBlock||n.isFinalized)&&(a.filter((function(e){var n=e.event;return N.events.system.ExtrinsicFailed.is(n)})).length?B(!1):B(!0))})),E()}catch(t){B(!1)}w(!1);case 2:case"end":return e.stop()}}),e)})))();case 9:case"end":return e.stop()}}),e)})));return function(n){return e.apply(this,arguments)}}()}})),X=Object(x.a)(Y,2),Z=X[0],z=X[1],Q=(a(320),a.p+"static/media/Logo-dark-2-clean.cbd38319.png"),ee=a.p+"static/media/basilisk-wallpaper-2.cc01249c.png",ne=a(176),ae=a.n(ne),te=u.incentives,ce=function(e,n,a,t){if(A.a.debug("calculateBsxMultiplier",n),e>=u.historicalAuctionData[u.targetAuctionId].closingEnd)return te.bsx.scale.rewardMultiplier.none;if((n||0)<u.targetAuctionId)return te.bsx.scale.rewardMultiplier.min;if(!a||!t)return te.bsx.scale.rewardMultiplier.min;var c=ae()([a,t],[te.bsx.scale.rewardMultiplier.min,te.bsx.scale.rewardMultiplier.max]);return e>=a?c(e):te.bsx.scale.rewardMultiplier.min},ie=u.incentives,re=ae()([ie.hdx.scale.leadPercentageDiff.min,ie.hdx.scale.leadPercentageDiff.max],[ie.hdx.scale.rewardMultiplier.min,ie.hdx.scale.rewardMultiplier.max]),se=a(82),oe=a(463),le=a(466),de='\n    chronicle(id: "'.concat("ChronicleKey",'") {\n        curBlockNum\n        curAuctionId,\n        curAuction {\n            closingStart,\n            closingEnd\n        }\n    }\n'),ue=Object(oe.a)(v||(v=Object(se.a)(["\n    query chronicle {\n        ","\n    }\n"])),de),be=(Object(oe.a)(O||(O=Object(se.a)(["\n    query ownCrowdloan($parachainId: String) {\n        crowdloans(filter: {\n            parachainId: {\n                equalTo: $parachainId\n            }\n        }){\n            ","\n        }\n    }\n"])),"\n    nodes{\n        id,\n        cap,\n        raised,\n        parachainId,\n        blockNum\n    }\n"),Object(oe.a)(w||(w=Object(se.a)(["\n    query getAggregatedCrowdloanBalances($parachainId: String, $onlySignificant: Boolean, $ownCrowdloanBlockNum: Int) {\n        aggregatedCrowdloanBalances(\n            filter: { \n                parachainId: { equalTo: $parachainId },\n                isSignificant: { equalTo: $onlySignificant }\n                blockNum: {\n                    greaterThanOrEqualTo: $ownCrowdloanBlockNum\n                }\n            },\n            orderBy: BLOCK_NUM_ASC\n        ) {\n            nodes {\n                id,\n                blockNum,\n                raised,\n                parachainId\n            }\n        }\n    }\n"]))),Object(oe.a)(p||(p=Object(se.a)(["\n    query siblingCrowdloanCandidates($ownParachainId: String) {\n        crowdloans(\n            filter: { \n                parachainId: { notEqualTo: $ownParachainId }\n                isFinished: { notEqualTo: true }\n                # only crowdloans that have not won an auction yet\n                wonAuctionId: { isNull: true }\n            }\n            first: 2\n            orderBy: RAISED_DESC\n        ) {\n            nodes {\n                blockNum\n                id\n                raised\n                parachainId\n            }\n        }\n    }\n"]))),Object(oe.a)(f||(f=Object(se.a)(["\n    query contributionsByAddressAndParachainId($account: String, $parachainId: String, $ownCrowdloanBlockNum: Int) {\n        contributions(\n            filter:{\n                account: {\n                    equalTo: $account\n                },\n                parachainId: {\n                    equalTo: $parachainId\n                },\n                blockNum: {\n                    greaterThan: $ownCrowdloanBlockNum\n                }\n            }\n        ){\n            nodes{\n                amount,\n                account,\n                parachainId,\n                blockNum\n            }\n        }\n    }\n"]))),Object(oe.a)(N||(N=Object(se.a)(["\n    query historicalSiblingCrowdloanCandidates($ownParachainId: String, $blockNums: [Int!]) {\n        aggregatedCrowdloanBalances(\n            filter: { \n                parachainId: { notEqualTo: $ownParachainId }\n                blockNum: { in: $blockNums }\n            }\n            orderBy: RAISED_DESC\n        ) {\n            nodes {\n                blockNum\n                id\n                raised\n                parachainId,\n                fund {\n                    wonAuctionId\n                }\n            }\n        }\n    }\n"]))),Object(oe.a)(k||(k=Object(se.a)(["\n    query historicalSiblingCrowdloanCandidates($ownParachainId: String, $blockNums: [Int!]) {\n        aggregatedCrowdloanBalances(\n            filter: { \n                parachainId: { equalTo: $ownParachainId }\n                # only crowdloans that have not won an auction yet\n                # wonAuctionId: { isNull: true }\n                blockNum: { in: $blockNums }\n            }\n        ) {\n            nodes {\n                blockNum\n                id\n                raised\n                parachainId,\n            }\n        }\n    }\n"]))),Object(oe.a)(C||(C=Object(se.a)(["\n    query contributions($ownParachainId: String, $ownCrowdloanBlockNum: Int) {\n        contributions(filter:{\n            parachainId: {\n                equalTo: $ownParachainId\n            },\n            blockNum:{\n                greaterThan: $ownCrowdloanBlockNum\n            },\n        }) {\n            totalCount,\n            nodes{\n                blockNum,\n                amount\n            }\n        }\n    }\n"]))),a(90),function(){var e=Object(le.a)(ue),n=Object(x.a)(e,2),a=n[0],i=n[1],r=T(),s=r.state,o=r.dispatch;return Object(c.useEffect)((function(){A.a.debug("useChronicleData","state.chronicle.loading",s.chronicle.loading),s.chronicle.loading&&a()}),[s.chronicle.loading,a]),Object(c.useEffect)((function(){var e=setInterval((function(){a()}),u.blockTime);return function(){clearInterval(e)}}),[]),Object(c.useEffect)((function(){var e,n,a;i.called&&!i.loading&&(A.a.debug("useChronicleData","chronicle",i),i.data&&o({type:t.SetChronicle,payload:{curBlockNum:i.data.chronicle.curBlockNum,curAuctionId:i.data.chronicle.curAuctionId?parseInt(i.data.chronicle.curAuctionId):0,curAuction:{closingStart:null===(e=i.data.chronicle.curAuction)||void 0===e?void 0:e.closingStart,closingEnd:null===(n=i.data.chronicle.curAuction)||void 0===n?void 0:n.closingEnd,blockNum:null===(a=i.data.chronicle.curAuction)||void 0===a?void 0:a.blockNum}}}))}),[i,o]),{chronicle:s.chronicle}}),je=function(e,n,a,t,c,i){A.a.debug("calculateIncentives",{blockNum:e,curAuctionId:n,curAuctionClosingStart:a,curAuctionClosingEnd:t,ownCrowdloanValuation:c,siblingCrowdloanValuation:i});var r=u.historicalAuctionData[u.targetAuctionId].closingEnd,s={hdxBonus:"0",bsxMultiplier:"0"};if(void 0==c)return A.a.debug("calculateIncentives","no ownCrowdloanValuation"),s;if(e>(r||0))return A.a.debug("calculateIncentives","contribution newer than target auction end"),s;var o=ce(e,n,a,t);A.a.debug("calculateIncentives","calculateBsxMultiplier",o);var l=!!a&&e>=a;A.a.debug("calculateIncentives","isAuctionClosing",l);var d=function(e,n,a){if(n.isLessThanOrEqualTo(e))return ie.hdx.scale.rewardMultiplier.min;var t=e.minus(n).dividedBy(n).multipliedBy(-1);A.a.debug("calculateHdxMultiplier","leadPercentageDiff",n.toFixed(0),e.toFixed(0),t.toFixed(u.incentives.precision));var c=t.isGreaterThanOrEqualTo(ie.hdx.scale.leadPercentageDiff.max)?ie.hdx.scale.rewardMultiplier.max:re(t);return A.a.debug("calculateHdxMultiplier","hdxBonus",c),c}(new V.a(i||0),new V.a(c||0));A.a.debug("calculateIncentives","hdxBonus",d);var b={hdxBonus:new V.a(d).toFixed(u.ksmPrecision),bsxMultiplier:new V.a(o).toFixed(u.ksmPrecision)};return A.a.debug("calculateIncentives","incentives",b),b},he=function(e,n){return e.reduce((function(e,a){A.a.debug("useCalculateRewardsReceived","hdxReward","contribution",a,n.data[a.blockNum]);var t=new V.a(a.amount).multipliedBy(u.ksmOpportunityCost);A.a.debug("useCalculateRewardsReceived","hdxReward","ksmOpportunityCostPerContribution",t);var c=n.data[a.blockNum]?t.multipliedBy(n.data[a.blockNum].hdxBonus):new V.a("0");return A.a.debug("useCalculateRewardsReceived","hdxReward","contributionHdxReward",c),new V.a(e).plus(c).toFixed(u.incentives.precision)}),"0")},xe=function(e,n,a,t,c){var i=e.reduce((function(e,a){var t=ce(a.blockNum,n.data.curAuctionId,n.data.curAuction.closingStart,n.data.curAuction.closingEnd);return A.a.debug("useCalculateRewardsReceived","accountWeight bsxMultiplier",t,{blockNum:a.blockNum,curAuctionId:n.data.curAuctionId,closingStart:n.data.curAuction.closingStart,closingEnd:n.data.curAuction.closingEnd}),new V.a(e).plus(new V.a(a.amount).multipliedBy(t)).toFixed(u.incentives.precision)}),"0");A.a.debug("useCalculateRewardsReceived","accountWeight",i),A.a.debug("useCalculateRewardsReceived","totalContributionWeight",a);var r=function(e,n,a){var t=n.reduce((function(e,n){var t=ce(n.blockNum,a.data.curAuctionId,a.data.curAuction.closingStart,a.data.curAuction.closingEnd);return A.a.debug("useCalculateRewardsReceived","accountWeight bsxMultiplier",t,{blockNum:n.blockNum,curAuctionId:a.data.curAuctionId,closingStart:a.data.curAuction.closingStart,closingEnd:a.data.curAuction.closingEnd}),new V.a(e).plus(new V.a(n.amount).multipliedBy(t)).toFixed(u.incentives.precision)}),"0");return new V.a(t).isZero()?new V.a("0").toFixed(u.incentives.precision):new V.a(u.incentives.bsx.allocated).dividedBy(e).multipliedBy(t).toFixed(u.incentives.precision)}(a||"0",e,n);A.a.debug("useCalculateRewardsReceived","accountCurrentBsxReward",r);var s=function(e,n,a){var t=n.reduce((function(e,n){var t=ce(n.blockNum,a.data.curAuctionId,a.data.curAuction.closingStart,a.data.curAuction.closingEnd);return A.a.debug("useCalculateRewardsReceived","accountWeight bsxMultiplier",t,{blockNum:n.blockNum,curAuctionId:a.data.curAuctionId,closingStart:a.data.curAuction.closingStart,closingEnd:a.data.curAuction.closingEnd}),new V.a(e).plus(new V.a(n.amount).multipliedBy(t)).toFixed(u.incentives.precision)}),"0");return new V.a(u.incentives.bsx.allocated).dividedBy(new V.a(e).multipliedBy(u.incentives.bsx.scale.rewardMultiplier.min)).multipliedBy(t).toFixed(u.incentives.precision)}(t.data.crowdloan.cap,e,n);return A.a.debug("useCalculateRewardsReceived","accountMinimumBsxReward",s),{accountCurrentBsxReward:r,accountMinimumBsxReward:s}},me=function(e){return new V.a(e).multipliedBy(new V.a(10).exponentiatedBy(12)).toFixed(u.ksmPrecision)},ge=function(e){return new V.a(e).dividedBy(new V.a(10).exponentiatedBy(12)).toFixed(u.ksmPrecision)},ve=function(e){return new V.a(e).multipliedBy(u.ksmToUsd).toFixed(u.ksmPrecision)},Oe=function(e){return new V.a(e).dividedBy(u.hdxToUsd).toFixed(u.ksmPrecision)},we=a(134),pe=a.n(we),fe=(a(321),function(e){var n=e.totalContributionWeight,a=(e.connectAccount,P()),t=D(),i=function(){var e,n,a,t,c=D(),i=P(),r=F(),s=je(c.data.curBlockNum,c.data.curAuctionId,null===(e=c.data.curAuction)||void 0===e?void 0:e.closingStart,null===(n=c.data.curAuction)||void 0===n?void 0:n.closingEnd,(null===(a=i.data.crowdloan)||void 0===a?void 0:a.raised)||void 0,(null===(t=r.data.crowdloan)||void 0===t?void 0:t.raised)||void 0);return i.data.crowdloan?s:{hdxBonus:null,bsxMultiplier:null}}(),r=z(),s=r.activeAccountBalance,o=r.lastContributionStatus,l=r.contribute,d=(r.activeAccount,Object(c.useState)(void 0)),u=Object(x.a)(d,2),j=u[0],h=u[1],m=Object(c.useState)({minimalBsxReceived:"0",currentBsxReward:"0",currentHdxReceived:"0"}),g=Object(x.a)(m,2),v=g[0],O=g[1];Object(c.useEffect)((function(){if(A.a.debug("CrowdloanContributeForm","calculating rewards",j,a,n),a&&t&&n&&a.data.crowdloan&&t.data.curBlockNum){var e=[{amount:j?me(j):"0",blockNum:t.data.curBlockNum}],c={data:{}};c.data[t.data.curBlockNum]={hdxBonus:i.hdxBonus};var r=xe(e,t,n,a);A.a.debug("CrowdloanContributeForm","historicalIncentives",c);var s=he(e,c);A.a.debug("CrowdloanContributeForm",r,s),O({minimalBsxReceived:new V.a(ge(r.accountMinimumBsxReward)).toFixed(6),currentBsxReward:new V.a(ge(r.accountCurrentBsxReward)).toFixed(6),currentHdxReceived:new V.a(Oe(ve(ge(s)))).toFixed(6)})}}),[j,a,t,n]);Object(c.useEffect)((function(){o&&h(0)}),[o]);A.a.debug("CrowdloanContributeForm","rewardsReceived",v);var w=function(){};return Object(b.jsxs)("div",{className:"bsx-contribute-form",children:[Object(b.jsxs)("div",{className:"bsx-form-wrapper",children:[Object(b.jsx)("label",{children:"ksm contribution"}),Object(b.jsx)(pe.a,{name:"amount",decimalsLimit:12,value:j,disabled:!0,placeholder:"Your sacrifice goes here",onValueChange:function(e){if(A.a.debug("CrowdloanContributeForm","handleContributeChange",e,s),void 0==e)return h(void 0);h(e)}}),Object(b.jsx)("label",{children:"minimal bsx received"}),Object(b.jsx)(pe.a,{name:"minimal bsx received",decimalsLimit:6,disabled:!0,value:v.minimalBsxReceived,onValueChange:w}),Object(b.jsx)("label",{children:"current bsx received"}),Object(b.jsx)(pe.a,{name:"current bsx received",decimalsLimit:6,disabled:!0,value:v.currentBsxReward,onValueChange:w}),Object(b.jsx)("label",{children:"current hdx received"}),Object(b.jsx)(pe.a,{name:"current hdx received",decimalsLimit:6,disabled:!0,value:v.currentHdxReceived,onValueChange:w}),Object(b.jsx)("button",{disabled:!0,onClick:function(){A.a.debug("CrowdloanContributeForm","handleContributeClick",j),l(me(j))},children:"Contribute"})]}),Object(b.jsx)("div",{className:"contribution-status",children:o?"Thanksss for your sacrifice":0==o?"There was a problem with your contribution, please try again.":""})]})}),Ne=a(261),ke=a(43),Ce=a(260);ke.b.register(Ce.a);Ne.a.animation=!1;var Ie=function(){T().dispatch,be().chronicle;var e="-";return Object(b.jsxs)("div",{className:"bsx-dashboard",children:[Object(b.jsx)("div",{className:"bsx-navbar",children:Object(b.jsx)("div",{className:"container-xl",children:Object(b.jsxs)("div",{className:"row",children:[Object(b.jsx)("div",{className:"col-3",children:Object(b.jsx)("div",{className:"bsx-logo",children:"basilisk"})}),Object(b.jsx)("div",{className:"col-9 bsx-menu-col",children:Object(b.jsxs)("div",{className:"bsx-menu",children:[Object(b.jsx)("div",{className:"bsx-menu-item",children:Object(b.jsx)("a",{href:"https://bsx.fi/",target:"_blank",children:"home"})}),Object(b.jsx)("div",{className:"bsx-menu-item",children:Object(b.jsx)("a",{href:"https://discord.gg/S8YZj5aXR6",target:"_blank",children:"discord"})}),Object(b.jsx)("div",{className:"bsx-eye",children:Object(b.jsx)("img",{src:Q})}),Object(b.jsx)("div",{className:"bsx-menu-item",children:Object(b.jsx)("a",{href:"https://github.com/galacticcouncil/Basilisk-node",target:"_blank",children:"github"})}),Object(b.jsx)("div",{className:"bsx-menu-item",children:Object(b.jsx)("a",{href:"https://docs.bsx.fi/",target:"_blank",children:"docs"})}),Object(b.jsx)("div",{className:"bsx-menu-item",children:Object(b.jsx)("a",{href:"https://basiliskfi.substack.com/",target:"_blank",children:"blog"})})]})})]})})}),Object(b.jsxs)("div",{className:"bsx-disclaimer",children:["Basilisk is taking a temporary leave of absence, it shall return for the next batch of parachain slot auctions. If you've made an offering to the snekk during the auctions for slot #1 - #5, your KSM will be returned automatically by the protocol at block 8467200 (2021-07-23 10:35).",Object(b.jsx)("br",{}),Object(b.jsx)("br",{})," Until then, make sure to follow our ",Object(b.jsx)("a",{href:"https://basiliskfi.substack.com/",target:"_blank",children:"blog"})," for the latest updates regarding Basilisk. Stay vigilant."]}),Object(b.jsx)("div",{className:"bsx-account",children:Object(b.jsxs)("div",{className:"container-xl",children:[Object(b.jsxs)("div",{className:"row bsx-account-selector-display",children:[Object(b.jsx)("div",{className:"col-9 bsx-address",children:Object(b.jsx)("div",{children:Object(b.jsxs)("span",{className:"bsx-chronicle",children:[e," / ",e]})})}),Object(b.jsx)("div",{className:"col-3 bsx-select-account",children:"change your account"})]}),Object(b.jsxs)("div",{className:"row bsx-stats",children:[Object(b.jsx)("div",{className:"col-9",children:Object(b.jsxs)("div",{className:"row",children:[Object(b.jsxs)("div",{className:"col-3 bsx-stat",children:[Object(b.jsx)("span",{className:"bsx-stat-title",children:"total ksm contributed"}),Object(b.jsx)("span",{className:"bsx-stat-value",children:e})]}),Object(b.jsxs)("div",{className:"col-3 bsx-stat",children:[Object(b.jsx)("span",{className:"bsx-stat-title",children:"minimal bsx received"}),Object(b.jsx)("span",{className:"bsx-stat-value",children:e})]}),Object(b.jsxs)("div",{className:"col-3 bsx-stat",children:[Object(b.jsx)("span",{className:"bsx-stat-title",children:"current bsx received"}),Object(b.jsx)("span",{className:"bsx-stat-value",children:e})]}),Object(b.jsxs)("div",{className:"col-3 bsx-stat",children:[Object(b.jsx)("span",{className:"bsx-stat-title",children:"current hdx reward"}),Object(b.jsx)("span",{className:"bsx-stat-value",children:e})]})]})}),Object(b.jsxs)("div",{className:"col-3 bsx-stat bsx-stat-balance",children:[Object(b.jsx)("span",{className:"bsx-stat-title",children:"balance"}),Object(b.jsx)("span",{className:"bsx-stat-value",children:e})]})]})]})}),Object(b.jsx)("div",{className:"container-xl",children:Object(b.jsxs)("div",{className:"row",children:[Object(b.jsxs)("div",{className:"col-9 bsx-graph",children:[Object(b.jsxs)("div",{className:"bsx-graph-wrapper",children:[Object(b.jsx)("div",{className:"bsx-annotation-container"}),Object(b.jsx)("div",{className:"bsx-graph-loader",children:"Snek is sleeping, for now."})]}),Object(b.jsxs)("div",{className:"bsx-graph-timeline",children:[Object(b.jsxs)("div",{className:"row",children:[Object(b.jsx)("div",{className:"col-3",children:"06.07"}),Object(b.jsxs)("div",{className:"col-6 bsx-legend",children:[Object(b.jsx)("span",{className:"basilisk",children:"Basilisk"})," / ",Object(b.jsx)("span",{className:"sibling",children:"Target"})," KSM raised"]}),Object(b.jsx)("div",{className:"col-3",children:"23.07"})]}),Object(b.jsx)("div",{className:"bsx-progress-bar-container",children:Object(b.jsx)("div",{className:"bsx-progress-bar",style:{width:"0%"}})})]})]}),Object(b.jsxs)("div",{className:"col-3 bsx-contribute",children:[Object(b.jsx)("div",{className:"bsx-incentives",children:Object(b.jsxs)(b.Fragment,{children:[Object(b.jsx)("div",{className:"bsx-incentive",children:Object(b.jsxs)("div",{className:"row",children:[Object(b.jsx)("div",{className:"col-6 name",children:Object(b.jsx)("span",{children:"hdx bonus"})}),Object(b.jsx)("div",{className:"col-6 value",children:Object(b.jsx)("span",{children:e})})]})}),Object(b.jsx)("div",{className:"bsx-incentive",children:Object(b.jsxs)("div",{className:"row",children:[Object(b.jsx)("div",{className:"col-8 name",children:Object(b.jsx)("span",{children:"bsx multiplier"})}),Object(b.jsx)("div",{className:"col-4 value",children:Object(b.jsx)("span",{children:e})})]})})]})}),Object(b.jsx)("div",{children:Object(b.jsx)(fe,{totalContributionWeight:"0",connectAccount:function(){}})})]})]})}),Object(b.jsx)("div",{className:"bsx-wallpaper",children:Object(b.jsx)("img",{src:ee})})]})};var Ae=function(){return Object(b.jsx)(h,{children:Object(b.jsx)(R,{children:Object(b.jsx)(Z,{children:Object(b.jsx)(Ie,{})})})})},Se=function(e){e&&e instanceof Function&&a.e(3).then(a.bind(null,471)).then((function(n){var a=n.getCLS,t=n.getFID,c=n.getFCP,i=n.getLCP,r=n.getTTFB;a(e),t(e),c(e),i(e),r(e)}))},Be=function(){var e=new URL(document.location).searchParams;return console.log("loglevel",e.get("loglevel")),e.get("loglevel")}()||"info";A.a.setLevel(Be),s.a.render(Object(b.jsx)(i.a.StrictMode,{children:Object(b.jsx)(Ae,{})}),document.getElementById("root")),Se()}},[[429,1,2]]]);
//# sourceMappingURL=main.88fa0951.chunk.js.map