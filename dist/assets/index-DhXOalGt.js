(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))i(t);new MutationObserver(t=>{for(const n of t)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function s(t){const n={};return t.integrity&&(n.integrity=t.integrity),t.referrerPolicy&&(n.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?n.credentials="include":t.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(t){if(t.ep)return;t.ep=!0;const n=s(t);fetch(t.href,n)}})();function k(c){return{"one-to-one":"1:1","one-to-many":"1:N","many-to-one":"N:1","many-to-many":"N:N"}[c.type]||c.type}function M(c){return!c.name||c.name.trim().length===0?{isValid:!1,error:"Field name is required"}:!c.type||c.type.trim().length===0?{isValid:!1,error:"Field type is required"}:{isValid:!0}}function O(c){return!c.from||!c.from.entity||!c.from.field?{isValid:!1,error:"Relationship source is incomplete"}:!c.to||!c.to.entity||!c.to.field?{isValid:!1,error:"Relationship target is incomplete"}:{isValid:!0}}function N(c){if(!c.name||c.name.trim().length===0)return{isValid:!1,error:"Entity name is required"};if(c.fields.length===0)return{isValid:!1,error:`Entity "${c.name}" has no fields`};for(const e of c.fields){const s=M(e);if(!s.isValid)return{isValid:!1,error:`Entity "${c.name}": ${s.error}`}}return{isValid:!0}}function A(c,e){const s=[],i=new Map(c.fields.map(t=>[t.name,t]));for(const t of e){const n=i.get(t);n&&(s.push(n),i.delete(t))}for(const t of i.values())s.push(t);c.fields=s}function z(c,e){c.fields.push(e)}function x(c){return{name:c.name,displayName:c.displayName,type:c.type,isPrimaryKey:c.isPrimaryKey,isForeignKey:c.isForeignKey,isUnique:c.isUnique,isRequired:c.isRequired,defaultValue:c.defaultValue,enumValues:c.enumValues,decorators:c.decorators}}function q(c){return{from:c.from,to:c.to,type:c.type,color:c.color,label:c.label}}function $(c){return{name:c.name,displayName:c.displayName,icon:c.icon,color:c.color,fields:c.fields.map(x)}}class F{constructor(e){this.diagramRepository=e}async execute(e){if(!e||e.trim()==="")return{entities:[],relationships:[],errors:[{message:"DSL text is empty",line:0}],isValid:!1};try{const s=await this.diagramRepository.parseDSL(e),i=[];for(const o of s.entities){const r=N(o);r.isValid||i.push({message:`Entity '${o.name}': ${r.error}`,line:0})}const t=[];for(const o of s.relationships){const r=O(o);r.isValid||t.push({message:`Relationship: ${r.error}`,line:0})}const n=[...s.errors,...i,...t];return{entities:s.entities,relationships:s.relationships,errors:n,isValid:n.length===0}}catch(s){return{entities:[],relationships:[],errors:[{message:s instanceof Error?s.message:"Unknown error",line:0}],isValid:!1}}}}class H{constructor(e){this.renderer=e}execute(e,s){if(!e||!Array.isArray(e))throw new Error("Entities must be an array");if(!s||!Array.isArray(s))throw new Error("Relationships must be an array");this.renderer.setData(e,s),this.renderer.render()}zoomIn(){this.renderer.zoomIn()}zoomOut(){this.renderer.zoomOut()}fitToScreen(){this.renderer.fitToScreen()}autoLayout(){this.renderer.autoLayout()}getZoomLevel(){return this.renderer.getZoomLevel()}}class B{constructor(e){this.exporters=e}execute(e,s,i){const t=this.exporters[e];if(!t)throw new Error(`Unsupported export format: ${e}`);return t.export(s,i)}getSupportedFormats(){return Object.keys(this.exporters)}}class U{constructor(e,s,i){this.parseDSLUseCase=e,this.renderDiagramUseCase=s,this.exportCodeUseCase=i}currentEntities=[];currentRelationships=[];async parseDSL(e){const s=await this.parseDSLUseCase.execute(e);return s.isValid&&(this.currentEntities=s.entities,this.currentRelationships=s.relationships),s}renderDiagram(){this.renderDiagramUseCase.execute(this.currentEntities,this.currentRelationships)}zoomIn(){this.renderDiagramUseCase.zoomIn()}zoomOut(){this.renderDiagramUseCase.zoomOut()}fitToScreen(){this.renderDiagramUseCase.fitToScreen()}autoLayout(){this.renderDiagramUseCase.autoLayout()}getZoomLevel(){return this.renderDiagramUseCase.getZoomLevel()}exportCode(e){return this.exportCodeUseCase.execute(e,this.currentEntities,this.currentRelationships)}getSupportedExportFormats(){return this.exportCodeUseCase.getSupportedFormats()}getCurrentData(){return{entities:this.currentEntities,relationships:this.currentRelationships}}}class V{name;displayName;icon;color;fields;constructor(e){this.name=e.name,this.displayName=e.displayName,this.icon=e.icon??"box",this.color=e.color??"#3b82f6",this.fields=e.fields??[]}}class W{name;displayName;type;isPrimaryKey;isForeignKey;isUnique;isRequired;defaultValue;enumValues;decorators;constructor(e){this.name=e.name,this.displayName=e.displayName,this.type=e.type,this.isPrimaryKey=e.isPrimaryKey??!1,this.isForeignKey=e.isForeignKey??!1,this.isUnique=e.isUnique??!1,this.isRequired=e.isRequired??!1,this.defaultValue=e.defaultValue??null,this.enumValues=e.enumValues??null,this.decorators=e.decorators??[]}}class Y{from;to;type;color;label;constructor(e){this.from=e.from,this.to=e.to,this.type=e.type??"many-to-one",this.color=e.color,this.label=e.label}}class j{async parseDSL(e){const s=[],i=[],t=[];try{const n=e.split(`
`).map(r=>{const l=r.indexOf("//");return l>=0?r.substring(0,l):r}).map(r=>r.trim()).filter(r=>r.length>0);let o=null;for(let r=0;r<n.length;r++){const l=n[r];if(l.includes("{")&&!l.startsWith("}")){const d=l.match(/^(\w+)\s*(\[([^\]]+)\])?\s*\{/);if(d){const a=d[1],h=d[3]||"",u=this._parseMetadata(h);o=new V({name:a,displayName:this._toDisplayName(a),icon:u.icon||"box",color:u.color||"#3b82f6",fields:[]})}}else if(l.startsWith("}"))o&&(s.push(o),o=null);else if(this._isRelationshipLine(l)){const d=this._parseRelationship(l);d&&i.push(d)}else if(o){const d=this._parseField(l);d&&z(o,d)}}}catch(n){t.push({message:n instanceof Error?n.message:"Unknown error",line:0})}return{entities:s,relationships:i,errors:t}}async saveDiagram(e){console.log("Saving diagram:",e)}async loadDiagram(){return null}_parseMetadata(e){const s={};if(!e)return s;const i=e.split(",");for(const t of i){const[n,o]=t.split(":").map(r=>r.trim());n&&o&&(s[n]=o)}return s}_parseField(e){const s=e.match(/^(\w+)\s+(\w+)(.*)$/);if(!s)return null;const i=s[1],t=s[2],n=s[3]||"",o=this._parseDecorators(n),r=o.some(L=>L.name==="pk"),l=o.some(L=>L.name==="fk"),d=o.some(L=>L.name==="unique"),a=o.some(L=>L.name==="required")||r,h=o.find(L=>L.name==="default"),u=h?h.args:null,f=o.find(L=>L.name==="enum"),p=f&&f.params&&f.params.fields?Array.isArray(f.params.fields)?f.params.fields:[f.params.fields]:null;return new W({name:i,displayName:this._toDisplayName(i),type:t,isPrimaryKey:r,isForeignKey:l,isUnique:d,isRequired:a,defaultValue:u,enumValues:p,decorators:o})}_parseDecorators(e){const s=[];if(!e)return s;const i=/@(\w+)(?:\(([^)]+)\))?/g;let t;for(;(t=i.exec(e))!==null;){const n=t[1],o=t[2];let r=null;const l={};if(o)if(o.includes(":")){const d=o.split(",");for(const a of d){const[h,u]=a.split(":").map(f=>f.trim());h&&u&&(u.startsWith("[")&&u.endsWith("]")?l[h]=u.substring(1,u.length-1).split(",").map(f=>f.trim()):l[h]=u)}}else r=o.trim();s.push({name:n,args:r,params:l})}return s}_isRelationshipLine(e){return/(\w+)\.?(\w+)?\s*([<>-]|<>)\s*(\w+)\.?(\w+)?/.test(e)}_parseRelationship(e){const s=/^(\w+)\.?(\w+)?\s*([<>-]|<>)\s*(\w+)\.?(\w+)?\s*(?:\[([^\]]+)\])?$/,i=e.match(s);if(!i)return null;let t=i[1],n=i[2]||"id";const o=i[3];let r=i[4],l=i[5]||"id";const d=i[6]||"";let a;switch(o){case"<":a="one-to-many";break;case">":a="many-to-one";break;case"-":a="one-to-one";break;case"<>":a="many-to-many";break;default:a="many-to-one"}const h=this._parseMetadata(d);return new Y({from:{entity:t,field:n},to:{entity:r,field:l},type:a,color:h.color,label:h.label})}_toDisplayName(e){return e.split("_").map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join(" ")}}class P{x;y;constructor(e){this.x=e.x,this.y=e.y}distanceTo(e){const s=this.x-e.x,i=this.y-e.y;return Math.sqrt(s*s+i*i)}add(e){return new P({x:this.x+e.x,y:this.y+e.y})}equals(e){return this.x===e.x&&this.y===e.y}toJSON(){return{x:this.x,y:this.y}}}class X{static convertToDirectedRelations(e){const s=[];console.log(`
=== ÉTAPE 1 : RELATIONS DÉTECTÉES ===`);for(const i of e){const t=i.from.entity,n=i.to.entity;s.push({left:t,right:n}),console.log(`${t} -> ${n}`)}return s}static orderEntities(e){console.log(`
=== ÉTAPE 2 : ORDRE DES ENTITÉS ===`);const s=new Map;for(const r of e)s.set(r.left,(s.get(r.left)||0)+1),s.set(r.right,(s.get(r.right)||0)+1);const i=new Set;for(const r of e)i.add(r.left),i.add(r.right);const t=new Set,n=[],o=[...e];for(;o.length>0;){const r=new Set;for(const h of o)r.add(h.right);let l=null,d=-1;for(const h of r){if(t.has(h))continue;const u=s.get(h)||0;u>d&&(d=u,l=h)}if(!l)break;n.push(l),t.add(l);const a=o.filter(h=>h.right===l);for(const h of a){const u=o.indexOf(h);u!==-1&&o.splice(u,1)}}return console.log(`Ordre: ${n.join(" -> ")}`),n}static buildClusters(e,s){console.log(`
=== ÉTAPE 3 : BUILD CLUSTERS ===
`);const i=new Map;for(let t=0;t<e.length;t++){const n=e[t],o=[],r=[n];for(const l of s)l.right===n&&!o.includes(l.left)&&o.push(l.left);i.set(n,{left:o,right:r}),console.log(`${t+1}) Cluster '${n}':`),console.log(`   ${JSON.stringify(o)} -> ${JSON.stringify(r)}`)}return i}static buildLayers(e,s,i){console.log(`
=== ÉTAPE 4 : BUILD LAYERS ===
`);const t=[],n=d=>{for(let a=0;a<t.length;a++)if(t[a].includes(d))return a;return null},o=d=>{for(const a of t){const h=a.indexOf(d);h!==-1&&a.splice(h,1)}},r=(d,a)=>{if(a>=t.length)return!0;for(const h of t[a])for(const u of i)if(u.left===d&&u.right===h||u.left===h&&u.right===d)return!1;return!0},l=(d,a)=>{const h=n(d);if(h===null)return null;o(a);for(let u=h+1;u<t.length;u++)if(r(a,u))return t[u].push(a),u;return t.push([a]),t.length-1};for(let d=0;d<e.length;d++){const a=e[d],h=s.get(a);if(!h)continue;const u=[...h.left],f=[...h.right];if(console.log(`${d+1}) Entité '${a}':`),console.log(`cluster-${a} -> ${JSON.stringify(u)} -> ${JSON.stringify(f)}`),console.log(),t.length===0){u.length>0&&t.push([...u]),t.push([...f]),console.log("=>"),t.forEach((w,g)=>{console.log(`Layer ${g}: ${JSON.stringify(w)}`)}),console.log();continue}let p=null,L=null;for(const w of f)if(n(w)!==null){p=w,L="right";break}if(p===null){for(const w of u)if(n(w)!==null){p=w,L="left";break}}if(p===null){const w=[];u.length>0&&w.push([...u]),w.push([...f]),t.unshift(...w),console.log("=>"),t.forEach((g,y)=>{console.log(`Layer ${y}: ${JSON.stringify(g)}`)}),console.log();continue}if(console.log(),L==="right"){const w=E=>{const v=[];for(const S of i)S.left===E&&v.push(S.right);return v},y=(E=>{const v=[],S=new Set,I=[E];for(;I.length>0;){const C=I.shift();if(S.has(C))continue;S.add(C);const T=w(C);for(const b of T)v.includes(b)||(v.push(b),I.push(b))}return v})(a);o(a);for(const E of y)o(E);for(const E of u)if(n(E)===null){let v=!1;for(let S=0;S<t.length;S++)if(r(E,S)){t[S].push(E),v=!0;break}v||t.push([E])}const m=u.map(E=>n(E)).filter(E=>E!==null),_=m.length>0?Math.max(...m):-1;let D=null;for(let E=_+1;E<t.length;E++)if(r(a,E)){t[E].push(a),D=E;break}if(D===null&&(t.push([a]),D=t.length-1),y.length>0){const E=new Map;E.set(a,0);const v=[a];for(;v.length>0;){const I=v.shift(),C=E.get(I),T=w(I);for(const b of T)y.includes(b)&&!E.has(b)&&(E.set(b,C+1),v.push(b))}const S=y.sort((I,C)=>{const T=E.get(I)||999,b=E.get(C)||999;return T-b});for(const I of S){let C=null;for(const T of i)if(T.right===I&&(T.left===a||S.includes(T.left))&&n(T.left)!==null){C=T.left;break}C&&l(C,I)}}}else{const w=[];for(const m of u)m!==p&&n(m)!==null&&w.push(m);const g=n(p);for(const m of u)m!==p&&!w.includes(m)&&!t[g].includes(m)&&t[g].push(m);let y=!1;for(let m=g+1;m<t.length;m++)if(r(a,m)){t[m].push(a),y=!0;break}y||t.push([a])}console.log("=>"),t.forEach((w,g)=>{console.log(`Layer ${g}: ${JSON.stringify(w)}`)}),console.log()}return t.filter(d=>d.length>0)}static reorderLayersByCluster(e,s,i){if(console.log(`
=== ÉTAPE 6 : RÉORGANISATION VERTICALE PAR CLUSTER ===
`),e.length===0)return e;const t=e.map(l=>[...l]),n=e.length-1,o=e[n],r=[];for(const l of s)o.includes(l)&&r.push(l);for(const l of o)r.includes(l)||r.push(l);t[n]=r,console.log(`Layer ${n}: ${JSON.stringify(o)} -> ${JSON.stringify(r)}`);for(let l=e.length-2;l>=0;l--){const d=e[l],a=t[l+1];console.log(`
Layer ${l}: ${JSON.stringify(d)}`);const h=new Map;for(const g of d){let y=null;for(const m of i)if(m.left===g&&a.includes(m.right)){y=m.right;break}h.set(g,y)}console.log(`   Connexions: ${JSON.stringify(Object.fromEntries(h))}`);const u=new Map;for(const g of d){const y=[];for(const m of i)m.left===g&&a.includes(m.right)&&y.push(m.right);u.set(g,y)}console.log("   Connexions multiples:",Object.fromEntries(Array.from(u.entries()).map(([g,y])=>[g,y.length>0?y:null])));const f=[],p=new Map;for(const g of d){const y=u.get(g)||[];if(y.length===0)p.set(g,-1);else{const m=Math.max(...y.map(_=>a.indexOf(_)));p.set(g,m)}}console.log("   Max target positions:",Object.fromEntries(p));const L=[...d].sort((g,y)=>{const m=p.get(g)??999,_=p.get(y)??999;if(m!==_)return m-_;const D=s.indexOf(g),E=s.indexOf(y);return D===-1&&E===-1?0:D===-1?1:E===-1?-1:D-E});f.push(...L);const w=new Map;for(const g of a){const y=d.filter(m=>(u.get(m)||[]).includes(g));y.length>0&&w.set(g,y)}for(const[g,y]of w)console.log(`   Cluster -> ${g}: ${JSON.stringify(y)}`);t[l]=f,console.log(`   => ${JSON.stringify(f)}`)}return t}static layout(e,s){const i=this.convertToDirectedRelations(s),t=this.orderEntities(i),n=this.buildClusters(t,i);let o=this.buildLayers(t,n,i);o=this.reorderLayersByCluster(o,t,i),console.log(`
=== RÉSULTAT FINAL AVEC ORGANISATION VERTICALE ===
`),o.forEach((d,a)=>{console.log(`Layer ${a}: ${JSON.stringify(d)}`)});const r=new Map,l=new Map;return o.forEach((d,a)=>{r.set(a,d),d.forEach(h=>{l.set(h,a)})}),e.forEach(d=>{if(!l.has(d.name)){const a=Math.max(...Array.from(l.values()),-1);l.set(d.name,a+1),r.has(a+1)||r.set(a+1,[]),r.get(a+1).push(d.name)}}),{layers:r,layerOf:l}}}class K{static calculateEntityHeight(e,s,i){return s+e.fields.length*i}static calculatePositions(e,s,i){const t=new Map,n=new Map;s.forEach(o=>n.set(o.name,o));for(const[o,r]of Array.from(e.entries()).sort((l,d)=>l[0]-d[0])){let l=0;const d=[];r.forEach(u=>{const f=n.get(u);if(f){const p=this.calculateEntityHeight(f,i.entityHeaderHeight,i.entityFieldHeight);d.push(p),l+=p}else d.push(i.entityHeaderHeight),l+=i.entityHeaderHeight}),l+=(r.length-1)*i.verticalSpacing;let a=Math.max(0,(i.displayHeight-l)/2);const h=i.baseX+o*i.horizontalSpacing;r.forEach((u,f)=>{t.set(u,new P({x:h,y:a})),a+=d[f]+i.verticalSpacing})}return t}}class J{static optimize(e,s,i){console.log("=== FIELD ORDERING ALGORITHM ===");const t=new Map;i.forEach(n=>{n.forEach((o,r)=>{t.set(o,r)})});for(let n=0;n<3;n++)e.forEach(o=>{const r=new Map;o.fields.forEach(a=>{const h=[];s.forEach(u=>{let f=null;if(u.from.entity===o.name&&u.from.field===a.name?f=u.to.entity:u.to.entity===o.name&&u.to.field===a.name&&(f=u.from.entity),f){const p=t.get(f);p!==void 0&&h.push(p)}}),r.set(a.name,h)});const l=o.fields.map(a=>{const h=r.get(a.name)||[],u=h.length>0?h.reduce((f,p)=>f+p,0)/h.length:1/0;return{name:a.name,avgTargetPos:u,hasConnections:h.length>0}}).sort((a,h)=>a.avgTargetPos===1/0&&h.avgTargetPos===1/0?0:a.avgTargetPos===1/0?1:h.avgTargetPos===1/0?-1:a.avgTargetPos-h.avgTargetPos).map(a=>a.name);A(o,l);const d=o.fields.map(a=>a.name);JSON.stringify(d)!==JSON.stringify(l)&&console.log(`  Reordered fields in ${o.name}:`,l)});console.log(`=== FIELD ORDERING COMPLETE ===
`)}}class Z{static optimize(e,s,i){return console.log(`
=== FIELD ORDERING OPTIMIZER ===`),console.log(`Optimizing field order within entities...
`),J.optimize(e,s,i),console.log(`=== FIELD ORDERING COMPLETE ===
`),i}}class G{canvas;ctx;entities=[];relationships=[];zoom=1;panX=50;panY=50;isDragging=!1;isPanning=!1;dragEntity=null;dragOffset={x:0,y:0};lastMousePos={x:0,y:0};entityPositions=new Map;entityWidth=250;entityHeaderHeight=50;entityFieldHeight=30;entityPadding=60;displayWidth=0;displayHeight=0;colors={background:"#ffffff",gridLine:"rgba(0,0,0,0.05)",entityBorder:"#e2e8f0",entityShadow:"rgba(0,0,0,0.1)",fieldText:"#475569",relationLine:"#3b82f6",primaryKeyBg:"#dbeafe",foreignKeyBg:"#fef3c7"};constructor(e){this.canvas=e;const s=e.getContext("2d");if(!s)throw new Error("Could not get 2D context from canvas");this.ctx=s,this._setupCanvas(),this._setupEventListeners()}setData(e,s){this.entities=e,this.relationships=s,this.entities.length>0?this.autoLayout():(this._initializePositions(),this.render())}render(){const e=this.ctx,s=this.displayWidth,i=this.displayHeight;e.clearRect(0,0,s,i),e.save(),e.translate(this.panX,this.panY),e.scale(this.zoom,this.zoom),this._drawRelationships(e),this._drawEntities(e),e.restore()}zoomIn(){const e=this.displayWidth/2,s=this.displayHeight/2,i=Math.min(3,this.zoom*1.2),t=i/this.zoom;this.panX=e-(e-this.panX)*t,this.panY=s-(s-this.panY)*t,this.zoom=i,this.render()}zoomOut(){const e=this.displayWidth/2,s=this.displayHeight/2,i=Math.max(.1,this.zoom/1.2),t=i/this.zoom;this.panX=e-(e-this.panX)*t,this.panY=s-(s-this.panY)*t,this.zoom=i,this.render()}fitToScreen(){if(this.entities.length===0)return;let e=1/0,s=1/0,i=-1/0,t=-1/0;for(const a of this.entities){const h=this.entityPositions.get(a.name);h&&(e=Math.min(e,h.x),s=Math.min(s,h.y),i=Math.max(i,h.x+this.entityWidth),t=Math.max(t,h.y+this.entityHeaderHeight+a.fields.length*this.entityFieldHeight))}if(!isFinite(e))return;const n=i-e,o=t-s,r=100,l=(this.displayWidth-r)/n,d=(this.displayHeight-r)/o;this.zoom=Math.min(l,d,1),this.panX=(this.displayWidth-n*this.zoom)/2-e*this.zoom,this.panY=(this.displayHeight-o*this.zoom)/2-s*this.zoom,this.render()}autoLayout(){this.entityPositions.clear();const{layers:e}=X.layout(this.entities,this.relationships),s=Z.optimize(this.entities,this.relationships,e),i=K.calculatePositions(s,this.entities,{entityWidth:this.entityWidth,entityHeaderHeight:this.entityHeaderHeight,entityFieldHeight:this.entityFieldHeight,horizontalSpacing:this.entityWidth+120,verticalSpacing:10,baseX:100,displayHeight:this.displayHeight});this.entityPositions=i,this._logLayoutDebugInfo(s),this.fitToScreen()}_logLayoutDebugInfo(e){console.groupCollapsed("🧭 Auto Layout Layers (Left → Right)"),console.log(`Number of layers detected: ${e.size}`);for(const[s,i]of Array.from(e.entries()).sort((t,n)=>t[0]-n[0]))console.log(`Layer ${s}: ${i.join(", ")}`);console.groupEnd()}getZoomLevel(){return Math.round(this.zoom*100)}_setupCanvas(){this._resizeCanvas(),window.addEventListener("resize",()=>{this._resizeCanvas(),this.render()})}_resizeCanvas(){const e=this.canvas.getBoundingClientRect(),s=window.devicePixelRatio||1;this.canvas.width=e.width*s,this.canvas.height=e.height*s,this.ctx.setTransform(1,0,0,1,0,0),this.ctx.scale(s,s),this.displayWidth=e.width,this.displayHeight=e.height}_setupEventListeners(){let e=!1;this.canvas.addEventListener("mousedown",i=>{e=!0;const t=this._screenToWorld(i.clientX,i.clientY),n=this._getEntityAtPoint(t.x,t.y);if(n){this.isDragging=!0,this.isPanning=!1,this.dragEntity=n;const o=this.entityPositions.get(n.name);this.dragOffset={x:t.x-o.x,y:t.y-o.y},this.canvas.style.cursor="move"}else this.entities.length>0&&(this.isPanning=!0,this.isDragging=!1,this.dragEntity=null,this.lastMousePos={x:i.clientX,y:i.clientY},this.canvas.style.cursor="grabbing")}),this.canvas.addEventListener("mousemove",i=>{if(!e){if(this.entities.length>0){const t=this._screenToWorld(i.clientX,i.clientY),n=this._getEntityAtPoint(t.x,t.y);this.canvas.style.cursor=n?"pointer":"default"}else this.canvas.style.cursor="default";return}if(this.isDragging&&this.dragEntity){const t=this._screenToWorld(i.clientX,i.clientY);this.entityPositions.set(this.dragEntity.name,new P({x:t.x-this.dragOffset.x,y:t.y-this.dragOffset.y})),this.render()}else if(this.isPanning){const t=i.clientX-this.lastMousePos.x,n=i.clientY-this.lastMousePos.y;this.panX+=t,this.panY+=n,this.lastMousePos={x:i.clientX,y:i.clientY},this.render()}});const s=i=>{if(e=!1,this.isDragging=!1,this.isPanning=!1,this.dragEntity=null,this.entities.length>0&&i){const t=this._screenToWorld(i.clientX,i.clientY),n=this._getEntityAtPoint(t.x,t.y);this.canvas.style.cursor=n?"pointer":"default"}else this.canvas.style.cursor="default"};this.canvas.addEventListener("mouseup",s),this.canvas.addEventListener("mouseleave",s),this.canvas.addEventListener("wheel",i=>{i.preventDefault();const t=this.canvas.getBoundingClientRect(),n=i.clientX-t.left,o=i.clientY-t.top,r=i.deltaY>0?.9:1.1,l=Math.max(.1,Math.min(3,this.zoom*r)),d=l/this.zoom;this.panX=n-(n-this.panX)*d,this.panY=o-(o-this.panY)*d,this.zoom=l,this.render()})}_screenToWorld(e,s){const i=this.canvas.getBoundingClientRect(),t=(e-i.left-this.panX)/this.zoom,n=(s-i.top-this.panY)/this.zoom;return{x:t,y:n}}_getEntityAtPoint(e,s){for(let i=this.entities.length-1;i>=0;i--){const t=this.entities[i],n=this.entityPositions.get(t.name);if(!n)continue;const o=this.entityWidth,r=this.entityHeaderHeight+t.fields.length*this.entityFieldHeight;if(e>=n.x&&e<=n.x+o&&s>=n.y&&s<=n.y+r)return t}return null}_initializePositions(){const e=Math.ceil(Math.sqrt(this.entities.length)),s=this.entityWidth+this.entityPadding*2;this.entities.forEach((i,t)=>{if(!this.entityPositions.has(i.name)){const n=Math.floor(t/e),o=t%e;this.entityPositions.set(i.name,new P({x:o*s+this.entityPadding,y:n*(300+this.entityPadding)+this.entityPadding}))}})}_drawEntities(e){for(const s of this.entities){const i=this.entityPositions.get(s.name);i&&this._drawEntity(e,s,i.x,i.y)}}_drawEntity(e,s,i,t){const n=this.entityWidth,o=this.entityHeaderHeight,r=this.entityFieldHeight,l=o+s.fields.length*r;e.shadowColor=this.colors.entityShadow,e.shadowBlur=10,e.shadowOffsetX=0,e.shadowOffsetY=2,e.fillStyle="#ffffff",e.fillRect(i,t,n,l),e.shadowColor="transparent",e.shadowBlur=0,e.strokeStyle=this.colors.entityBorder,e.lineWidth=2,e.strokeRect(i,t,n,l),e.fillStyle=s.color||"#3b82f6",e.fillRect(i,t,n,o),e.fillStyle="#ffffff",e.font="bold 16px -apple-system, sans-serif",e.textAlign="center",e.textBaseline="middle",e.fillText(s.displayName,i+n/2,t+o/2),s.fields.forEach((d,a)=>{const h=t+o+a*r;this._drawField(e,d,i,h,n,r)})}_drawField(e,s,i,t,n,o){s.isPrimaryKey?(e.fillStyle=this.colors.primaryKeyBg,e.fillRect(i,t,n,o)):s.isForeignKey&&(e.fillStyle=this.colors.foreignKeyBg,e.fillRect(i,t,n,o)),e.strokeStyle=this.colors.entityBorder,e.lineWidth=1,e.beginPath(),e.moveTo(i,t),e.lineTo(i+n,t),e.stroke(),e.fillStyle=this.colors.fieldText,e.font="14px -apple-system, monospace",e.textAlign="left",e.textBaseline="middle";let r=s.name;s.isPrimaryKey&&(r+=" 🔑"),s.isForeignKey&&(r+=" 🔗"),s.isUnique&&(r+=" ✦"),e.fillText(r,i+10,t+o/2),e.fillStyle="#94a3b8",e.font="12px -apple-system, monospace",e.textAlign="right",e.fillText(s.type,i+n-10,t+o/2)}_drawRelationships(e){for(const s of this.relationships)this._drawRelationship(e,s)}_getFieldYPosition(e,s,i){const t=e.fields.findIndex(n=>n.name===s);return t===-1?i.y+this.entityHeaderHeight+e.fields.length*this.entityFieldHeight/2:i.y+this.entityHeaderHeight+t*this.entityFieldHeight+this.entityFieldHeight/2}_drawRelationship(e,s){const i=this.entities.find(m=>m.name===s.from.entity),t=this.entities.find(m=>m.name===s.to.entity);if(!i||!t)return;const n=this.entityPositions.get(i.name),o=this.entityPositions.get(t.name);if(!n||!o)return;const r=this._getFieldYPosition(i,s.from.field,n),l=this._getFieldYPosition(t,s.to.field,o),d=n.x+this.entityWidth/2,a=o.x+this.entityWidth/2,h=a-d;let u,f,p,L;h>0?(u=n.x+this.entityWidth,f=r,p=o.x,L=l):h<0?(u=n.x,f=r,p=o.x+this.entityWidth,L=l):r<l?(u=d,f=n.y+this.entityHeaderHeight+i.fields.length*this.entityFieldHeight,p=a,L=o.y):(u=d,f=n.y,p=a,L=o.y+this.entityHeaderHeight+t.fields.length*this.entityFieldHeight);const w=s.color||this.colors.relationLine;if(e.strokeStyle=w,e.fillStyle=w,e.lineWidth=2,e.setLineDash([5,5]),e.beginPath(),e.moveTo(u,f),h!==0){const m=(u+p)/2;e.lineTo(m,f),e.lineTo(m,L),e.lineTo(p,L)}else{const m=(f+L)/2;e.lineTo(u,m),e.lineTo(p,m),e.lineTo(p,L)}e.stroke(),e.setLineDash([]),this._drawCardinalityMarkers(e,s,u,f,p,L,w);const g=(u+p)/2,y=(f+L)/2;s.label&&(e.fillStyle=w,e.font="italic 11px -apple-system, sans-serif",e.textAlign="center",e.textBaseline="top",e.fillText(s.label,g,y+5)),e.fillStyle=w,e.font="bold 12px -apple-system, sans-serif",e.textAlign="center",e.textBaseline="bottom",e.fillText(k(s),g,y-5)}_drawCardinalityMarkers(e,s,i,t,n,o,r){switch(e.strokeStyle=r,e.fillStyle=r,e.lineWidth=2,s.type){case"one-to-one":this._drawSingleMarker(e,i,t,"left"),this._drawSingleMarker(e,n,o,"right");break;case"one-to-many":this._drawSingleMarker(e,i,t,"left"),this._drawCrowsFoot(e,n,o,"right");break;case"many-to-one":this._drawCrowsFoot(e,i,t,"left"),this._drawSingleMarker(e,n,o,"right");break;case"many-to-many":this._drawCrowsFoot(e,i,t,"left"),this._drawCrowsFoot(e,n,o,"right");break}}_drawSingleMarker(e,s,i,t){e.beginPath(),t==="left"?(e.moveTo(s-10,i-5),e.lineTo(s-10,i+5)):(e.moveTo(s+10,i-5),e.lineTo(s+10,i+5)),e.stroke()}_drawCrowsFoot(e,s,i,t){e.beginPath(),t==="left"?(e.moveTo(s,i),e.lineTo(s-12,i-8),e.moveTo(s,i),e.lineTo(s-12,i),e.moveTo(s,i),e.lineTo(s-12,i+8)):(e.moveTo(s,i),e.lineTo(s+12,i-8),e.moveTo(s,i),e.lineTo(s+12,i),e.moveTo(s,i),e.lineTo(s+12,i+8)),e.stroke()}}class Q{export(e,s){let i=`-- Generated SQL DDL

`;for(const t of e){i+=`CREATE TABLE ${t.name} (
`;const n=t.fields.map(o=>{let r=`  ${o.name} `;return r+={string:"VARCHAR(255)",int:"INTEGER",bool:"BOOLEAN",timestamp:"TIMESTAMP",datetime:"DATETIME",num:"NUMERIC",double:"DOUBLE PRECISION"}[o.type]||"TEXT",o.isPrimaryKey&&(r+=" PRIMARY KEY"),o.isRequired&&!o.isPrimaryKey&&(r+=" NOT NULL"),o.isUnique&&(r+=" UNIQUE"),o.defaultValue&&(r+=` DEFAULT ${o.defaultValue}`),r});i+=n.join(`,
`)+`
);

`}for(const t of s)i+=`ALTER TABLE ${t.from.entity}
`,i+=`  ADD CONSTRAINT fk_${t.from.entity}_${t.to.entity}
`,i+=`  FOREIGN KEY (${t.from.field})
`,i+=`  REFERENCES ${t.to.entity}(${t.to.field});

`;return i}}class ee{export(e,s){let i=`// Generated TypeScript Interfaces

`;for(const t of e){i+=`export interface ${t.displayName.replace(/\s+/g,"")} {
`;for(const n of t.fields){const o=n.isRequired?"":"?",l={string:"string",int:"number",num:"number",double:"number",bool:"boolean",timestamp:"Date",datetime:"Date"}[n.type]||"any";n.enumValues&&n.enumValues.length>0?i+=`  ${n.name}${o}: ${n.enumValues.map(d=>`'${d}'`).join(" | ")};
`:i+=`  ${n.name}${o}: ${l};
`}i+=`}

`}return i}}class te{export(e,s){const i={entities:e.map(t=>$(t)),relationships:s.map(t=>q(t))};return JSON.stringify(i,null,2)}}class ie{constructor(e,s){this.diagramService=e,this.editorFactory=s}editor=null;async initialize(){await this._initializeEditor(),this._setupEventListeners(),this._initializeLucideIcons(),await this._onDSLChange()}async _initializeEditor(){const e=this._getDefaultDSL();this.editor=await this.editorFactory.createEditor(e),this.editor.onDidChangeModelContent(()=>{this._onDSLChange()})}_setupEventListeners(){document.getElementById("zoomInBtn").addEventListener("click",()=>{this.diagramService.zoomIn(),this._updateZoomLevel()}),document.getElementById("zoomOutBtn").addEventListener("click",()=>{this.diagramService.zoomOut(),this._updateZoomLevel()}),document.getElementById("fitBtn").addEventListener("click",()=>{this.diagramService.fitToScreen(),this._updateZoomLevel()}),document.getElementById("autoLayoutBtn").addEventListener("click",()=>{this.diagramService.autoLayout()}),document.getElementById("formatBtn").addEventListener("click",()=>{this._formatDSL()}),document.getElementById("validateBtn").addEventListener("click",()=>{this._validateDSL()}),document.getElementById("exportBtn").addEventListener("click",()=>{this._exportCode()}),document.getElementById("saveBtn").addEventListener("click",()=>{this._saveDSL()}),document.getElementById("resetBtn").addEventListener("click",()=>{confirm("Reset to default DSL? This will clear your current work.")&&this.editor.setValue(this._getDefaultDSL())}),this._setupResizeHandle()}_setupResizeHandle(){const e=document.getElementById("resizeHandle"),s=document.querySelector(".canvas-area"),i=document.querySelector(".editor-area");let t=!1;e.addEventListener("mousedown",n=>{t=!0,document.body.style.cursor="ew-resize",n.preventDefault()}),document.addEventListener("mousemove",n=>{if(!t)return;const o=document.querySelector(".main-content").clientWidth,r=o-n.clientX,l=n.clientX,d=r/o*100,a=l/o*100;d>=15&&d<=50&&(s.style.flex=`0 0 ${a}%`,i.style.flex=`0 0 ${d}%`)}),document.addEventListener("mouseup",()=>{t=!1,document.body.style.cursor="default"})}async _onDSLChange(){const e=this.editor.getValue(),s=await this.diagramService.parseDSL(e);this.diagramService.renderDiagram(),this._updateStatus(s),this._updateInfo(s),this._updateZoomLevel()}_updateStatus(e){const s=document.getElementById("statusIndicator"),i=document.getElementById("errorMessage");e.isValid?(s.className="status-ok",s.innerHTML='<i data-lucide="check-circle"></i> Valid',i.textContent=""):(s.className="status-error",s.innerHTML='<i data-lucide="alert-circle"></i> Error',i.textContent=e.errors.map(t=>t.message).join(", ")),this._initializeLucideIcons()}_updateInfo(e){document.getElementById("entityCount").textContent=`${e.entities.length} ${e.entities.length===1?"entity":"entities"}`,document.getElementById("relationCount").textContent=`${e.relationships.length} ${e.relationships.length===1?"relation":"relations"}`}_updateZoomLevel(){const e=this.diagramService.getZoomLevel();document.getElementById("zoomLevel").textContent=`${e}%`}_formatDSL(){const s=this.editor.getValue().split(`
`),i=[];let t=0;for(const n of s){const o=n.trim();if(!o){i.push("");continue}o.includes("}")&&t--,i.push("  ".repeat(Math.max(0,t))+o),o.includes("{")&&t++}this.editor.setValue(i.join(`
`))}async _validateDSL(){const e=this.editor.getValue(),s=await this.diagramService.parseDSL(e);s.isValid?alert("✓ DSL is valid!"):alert(`✗ DSL has errors:

`+s.errors.map(i=>`Line ${i.line}: ${i.message}`).join(`
`))}_saveDSL(){const e=this.editor.getValue(),s=new Blob([e],{type:"text/plain"}),i=URL.createObjectURL(s),t=document.createElement("a");t.href=i,t.download="schema.dsl",t.click(),URL.revokeObjectURL(i)}_exportCode(){const e=prompt(`Export format:
1 - DSL (current format)
2 - JSON Schema
3 - SQL DDL
4 - TypeScript Interfaces

Enter number (1-4):`,"1");if(!e)return;let s="",i="txt";try{switch(e){case"1":s=this.editor.getValue(),i="dsl";break;case"2":s=this.diagramService.exportCode("json"),i="json";break;case"3":s=this.diagramService.exportCode("sql"),i="sql";break;case"4":s=this.diagramService.exportCode("typescript"),i="ts";break;default:alert("Invalid format");return}const t=new Blob([s],{type:"text/plain"}),n=URL.createObjectURL(t),o=document.createElement("a");o.href=n,o.download=`export.${i}`,o.click(),URL.revokeObjectURL(n)}catch(t){alert(`Export error: ${t instanceof Error?t.message:"Unknown error"}`)}}_initializeLucideIcons(){window.lucide&&window.lucide.createIcons()}_getDefaultDSL(){return`
// Comprehensive Relationships Demo
// This example demonstrates all relationship types and features

// Users entity
users {
    id uuid @pk
    username string @unique @required
    email string @unique @required
    profileId uuid @fk
}

// Profiles entity (one-to-one with users)
profiles {
    id uuid @pk
    userId uuid @fk @unique
    bio text
    avatar string
}

// Teams entity
teams {
    id uuid @pk
    name string @required
    description text
}

// Posts entity
posts {
    id uuid @pk
    authorId uuid @fk @required
    title string @required
    content text
    status string @enum(fields: [draft, published, archived])
}

// Comments entity
comments {
    id uuid @pk
    postId uuid @fk @required
    text text @required
    createdAt timestamp @default(now)
  userId uuid required
}

// Tags entity (for many-to-many with posts)
tags {
    id uuid @pk
    userId uuid @fk @required
    name string @unique @required
}

// Post-Tags junction table (many-to-many)
post_tags {
    id uuid @pk
    postId uuid @fk @required
    tagId uuid @fk @required
}
roles [icon: shield, color: orange] {

  id uuid pk
  name string unique required
  description text
}
permissions [icon: key, color: green] {

  id uuid pk
  name string unique required
  description text
}
user_roles [icon: users, color: purple] {

  id uuid pk
  userId uuid required
  roleId uuid required
}
role_permissions [icon: lock, color: teal] {

  id uuid pk
  roleId uuid required
  permissionId uuid required
}
projects [icon: folder, color: blue] {

  id uuid pk
  name string required
  description text
  teamId uuid required
  createdAt timestamp
}
milestones [icon: flag, color: yellow] {

  id uuid pk
  projectId uuid required
  name string required
  dueDate date
  status string
}
attachments [icon: paperclip, color: gray] {

  id uuid pk
  postId uuid required
  filename string required
  url string required
  uploadedAt timestamp
}
notifications [icon: bell, color: red] {

  id uuid pk
  userId uuid required
  message string required
  read boolean
  createdAt timestamp
}
user_projects [icon: users, color: pink] {

  id uuid pk
  userId uuid required
  projectId uuid required
}


// ============================================
// RELATIONSHIPS
// ============================================

// One-to-One: Users to Profiles
// Each user has exactly one profile
users.profileId - profiles.id

// Many-to-One: Posts to Users
// Many posts belong to one author (user)
posts.authorId > users.id

// Many-to-One: Users to Teams
// Many users belong to one team
users.id > teams.id

// Many-to-One: Comments to Posts
// Many comments belong to one post
comments.postId > posts.id

// Many-to-One: Comments to Users
// Many comments belong to one user
tags.userId > users.id

// Many-to-Many: Posts to Tags (through post_tags)
// Posts can have many tags, tags can belong to many posts
post_tags.postId > posts.id
post_tags.tagId > tags.id

// Alternative entity-level syntax (defaults to id fields):
// users > teams
// This is equivalent to: users.id > teams.id
user_roles.userId > users.id
user_roles.roleId > roles.id
role_permissions.roleId > roles.id
role_permissions.permissionId > permissions.id
projects.teamId > teams.id
milestones.projectId > projects.id
attachments.postId > posts.id
notifications.userId > roles.id
user_projects.userId > users.id
user_projects.projectId > projects.id
projects.id < posts.authorId
comments.userId > users.id

    `}}class se{async createEditor(e){return new Promise((s,i)=>{try{window.require.config({paths:{vs:"https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs"}}),window.require(["vs/editor/editor.main"],()=>{const t=window.monaco;t.languages.register({id:"dsl"}),t.languages.setMonarchTokensProvider("dsl",{tokenizer:{root:[[/\/\/.*$/,"comment"],[/@\w+/,"decorator"],[/\b(string|int|bool|timestamp|datetime|num|double)\b/,"type"],[/\b(true|false|now)\b/,"keyword"],[/\[([^\]]+)\]/,"metadata"],[/\{|\}/,"delimiter.bracket"],[/->/,"operator"]]}}),t.editor.defineTheme("dsl-dark",{base:"vs-dark",inherit:!0,rules:[{token:"comment",foreground:"6A9955"},{token:"decorator",foreground:"DCDCAA",fontStyle:"bold"},{token:"type",foreground:"4EC9B0"},{token:"keyword",foreground:"C586C0"},{token:"metadata",foreground:"9CDCFE"},{token:"operator",foreground:"D4D4D4"}],colors:{"editor.background":"#0f172a","editor.lineHighlightBackground":"#1e293b"}});const n=t.editor.create(document.getElementById("dslEditor"),{value:e,language:"dsl",theme:"dsl-dark",automaticLayout:!0,fontSize:14,minimap:{enabled:!1},scrollBeyondLastLine:!1,lineNumbers:"on",folding:!0,wordWrap:"on"});s(n)},t=>{console.error("Failed to load Monaco Editor:",t),i(t)})}catch(t){console.error("Error configuring Monaco Editor:",t),i(t)}})}}class R{container;constructor(){this.container=this._setupDependencyContainer()}_setupDependencyContainer(){const e={};e.diagramRepository=new j;const s=document.getElementById("diagramCanvas");if(!s)throw new Error("Canvas element not found");return e.renderer=new G(s),e.exporters={sql:new Q,typescript:new ee,json:new te},e.parseDSLUseCase=new F(e.diagramRepository),e.renderDiagramUseCase=new H(e.renderer),e.exportCodeUseCase=new B(e.exporters),e.diagramService=new U(e.parseDSLUseCase,e.renderDiagramUseCase,e.exportCodeUseCase),e.editorFactory=new se,e.appController=new ie(e.diagramService,e.editorFactory),e}async start(){try{console.log("🚀 Starting ERP Visual Designer with Clean Architecture..."),await this.container.appController.initialize(),console.log("✅ Application initialized successfully")}catch(e){console.error("❌ Failed to initialize application:",e),alert("Failed to initialize application. Please check the console for details.")}}}document.addEventListener("DOMContentLoaded",()=>{new R().start()});window.__app=R;
//# sourceMappingURL=index-DhXOalGt.js.map
