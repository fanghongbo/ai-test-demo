(()=>{/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */var Of=0,Pu=1,Bf=2;var Iu=1,il=2,Ri=3,xn=0,rn=1,Wt=2,tn=0,Ti=1,fs=2,Du=3,Lu=4,sl=5,Zn=100,kf=101,Hf=102,zf=103,Vf=104,Gs=200,Gf=201,Wf=202,Xf=203,Da=204,La=205,No=206,qf=207,Uo=208,Yf=209,Zf=210,Kf=211,$f=212,Jf=213,jf=214,rl=0,ol=1,al=2,Ps=3,ll=4,cl=5,ul=6,hl=7,Fu=0,Qf=1,ed=2,jn=0,fl=1,dl=2,pl=3,ml=4,gl=5,Ar=6,xl=7;var Nu=300,Ws=301,Xs=302,vl=303,yl=304,Oo=306,bn=1e3,On=1001,Fa=1002,Zt=1003,td=1004;var Bo=1005;var fn=1006,_l=1007;var Qn=1008;var vn=1009,Uu=1010,Ou=1011,Rr=1012,Ml=1013,ds=1014,ei=1015,$t=1016,Sl=1017,bl=1018,ps=1020,Bu=35902,ku=35899,Hu=1021,zu=1022,dn=1023,xr=1026,ms=1027,El=1028,Tl=1029,Vu=1030,wl=1031;var Al=1033,ko=33776,Ho=33777,zo=33778,Vo=33779,Rl=35840,Cl=35841,Pl=35842,Il=35843,Dl=36196,Ll=37492,Fl=37496,Nl=37808,Ul=37809,Ol=37810,Bl=37811,kl=37812,Hl=37813,zl=37814,Vl=37815,Gl=37816,Wl=37817,Xl=37818,ql=37819,Yl=37820,Zl=37821,Kl=36492,$l=36494,Jl=36495,jl=36283,Ql=36284,ec=36285,tc=36286;var io=2300,Na=2301,Ia=2302,xu=2400,vu=2401,yu=2402;var nd=3200,Cr=3201;var Pr=0,id=1,ti="",Kt="srgb",_i="srgb-linear",so="linear",Tt="srgb";var Rs=7680;var _u=519,sd=512,rd=513,od=514,Gu=515,ad=516,ld=517,cd=518,ud=519,Mu=35044,Yi=35048;var Wu="300 es",yi=2e3,ro=2001;var Gi=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}},Mn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Gc=Math.PI/180,oo=180/Math.PI;function Ir(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Mn[i&255]+Mn[i>>8&255]+Mn[i>>16&255]+Mn[i>>24&255]+"-"+Mn[e&255]+Mn[e>>8&255]+"-"+Mn[e>>16&15|64]+Mn[e>>24&255]+"-"+Mn[t&63|128]+Mn[t>>8&255]+"-"+Mn[t>>16&255]+Mn[t>>24&255]+Mn[n&255]+Mn[n>>8&255]+Mn[n>>16&255]+Mn[n>>24&255]).toLowerCase()}function pt(i,e,t){return Math.max(e,Math.min(t,i))}function mm(i,e){return(i%e+e)%e}function Wc(i,e,t){return(1-t)*i+t*e}function qr(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function Un(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}var be=class i{constructor(e=0,t=0){i.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=pt(this.x,e.x,t.x),this.y=pt(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=pt(this.x,e,t),this.y=pt(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(pt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(pt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*s+e.x,this.y=r*s+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Ut=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,o,a){let l=n[s+0],c=n[s+1],u=n[s+2],h=n[s+3],f=r[o+0],d=r[o+1],g=r[o+2],x=r[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h;return}if(a===1){e[t+0]=f,e[t+1]=d,e[t+2]=g,e[t+3]=x;return}if(h!==x||l!==f||c!==d||u!==g){let p=1-a,m=l*f+c*d+u*g+h*x,y=m>=0?1:-1,_=1-m*m;if(_>Number.EPSILON){let w=Math.sqrt(_),S=Math.atan2(w,m*y);p=Math.sin(p*S)/w,a=Math.sin(a*S)/w}let v=a*y;if(l=l*p+f*v,c=c*p+d*v,u=u*p+g*v,h=h*p+x*v,p===1-a){let w=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=w,c*=w,u*=w,h*=w}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,s,r,o){let a=n[s],l=n[s+1],c=n[s+2],u=n[s+3],h=r[o],f=r[o+1],d=r[o+2],g=r[o+3];return e[t]=a*g+u*h+l*d-c*f,e[t+1]=l*g+u*f+c*h-a*d,e[t+2]=c*g+u*d+a*f-l*h,e[t+3]=u*g-a*h-l*f-c*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),u=a(s/2),h=a(r/2),f=l(n/2),d=l(s/2),g=l(r/2);switch(o){case"XYZ":this._x=f*u*h+c*d*g,this._y=c*d*h-f*u*g,this._z=c*u*g+f*d*h,this._w=c*u*h-f*d*g;break;case"YXZ":this._x=f*u*h+c*d*g,this._y=c*d*h-f*u*g,this._z=c*u*g-f*d*h,this._w=c*u*h+f*d*g;break;case"ZXY":this._x=f*u*h-c*d*g,this._y=c*d*h+f*u*g,this._z=c*u*g+f*d*h,this._w=c*u*h-f*d*g;break;case"ZYX":this._x=f*u*h-c*d*g,this._y=c*d*h+f*u*g,this._z=c*u*g-f*d*h,this._w=c*u*h+f*d*g;break;case"YZX":this._x=f*u*h+c*d*g,this._y=c*d*h+f*u*g,this._z=c*u*g-f*d*h,this._w=c*u*h-f*d*g;break;case"XZY":this._x=f*u*h-c*d*g,this._y=c*d*h-f*u*g,this._z=c*u*g+f*d*h,this._w=c*u*h+f*d*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],u=t[6],h=t[10],f=n+a+h;if(f>0){let d=.5/Math.sqrt(f+1);this._w=.25/d,this._x=(u-l)*d,this._y=(r-c)*d,this._z=(o-s)*d}else if(n>a&&n>h){let d=2*Math.sqrt(1+n-a-h);this._w=(u-l)/d,this._x=.25*d,this._y=(s+o)/d,this._z=(r+c)/d}else if(a>h){let d=2*Math.sqrt(1+a-n-h);this._w=(r-c)/d,this._x=(s+o)/d,this._y=.25*d,this._z=(l+u)/d}else{let d=2*Math.sqrt(1+h-n-a);this._w=(o-s)/d,this._x=(r+c)/d,this._y=(l+u)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(pt(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+o*a+s*c-r*l,this._y=s*u+o*l+r*a-n*c,this._z=r*u+o*c+n*l-s*a,this._w=o*u-n*a-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,s=this._y,r=this._z,o=this._w,a=o*e._w+n*e._x+s*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=s,this._z=r,this;let l=1-a*a;if(l<=Number.EPSILON){let d=1-t;return this._w=d*o+t*this._w,this._x=d*n+t*this._x,this._y=d*s+t*this._y,this._z=d*r+t*this._z,this.normalize(),this}let c=Math.sqrt(l),u=Math.atan2(c,a),h=Math.sin((1-t)*u)/c,f=Math.sin(t*u)/c;return this._w=o*h+this._w*f,this._x=n*h+this._x*f,this._y=s*h+this._y*f,this._z=r*h+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},D=class i{constructor(e=0,t=0,n=0){i.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(cf.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(cf.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*s-a*n),u=2*(a*t-r*s),h=2*(r*n-o*t);return this.x=t+l*c+o*h-a*u,this.y=n+l*u+a*c-r*h,this.z=s+l*h+r*u-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=pt(this.x,e.x,t.x),this.y=pt(this.y,e.y,t.y),this.z=pt(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=pt(this.x,e,t),this.y=pt(this.y,e,t),this.z=pt(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(pt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Xc.copy(this).projectOnVector(e),this.sub(Xc)}reflect(e){return this.sub(Xc.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(pt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Xc=new D,cf=new Ut,ot=class i{constructor(e,t,n,s,r,o,a,l,c){i.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c)}set(e,t,n,s,r,o,a,l,c){let u=this.elements;return u[0]=e,u[1]=s,u[2]=a,u[3]=t,u[4]=r,u[5]=l,u[6]=n,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],u=n[4],h=n[7],f=n[2],d=n[5],g=n[8],x=s[0],p=s[3],m=s[6],y=s[1],_=s[4],v=s[7],w=s[2],S=s[5],E=s[8];return r[0]=o*x+a*y+l*w,r[3]=o*p+a*_+l*S,r[6]=o*m+a*v+l*E,r[1]=c*x+u*y+h*w,r[4]=c*p+u*_+h*S,r[7]=c*m+u*v+h*E,r[2]=f*x+d*y+g*w,r[5]=f*p+d*_+g*S,r[8]=f*m+d*v+g*E,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8];return t*o*u-t*a*c-n*r*u+n*a*l+s*r*c-s*o*l}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=u*o-a*c,f=a*l-u*r,d=c*r-o*l,g=t*h+n*f+s*d;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/g;return e[0]=h*x,e[1]=(s*c-u*n)*x,e[2]=(a*n-s*o)*x,e[3]=f*x,e[4]=(u*t-s*l)*x,e[5]=(s*r-a*t)*x,e[6]=d*x,e[7]=(n*l-c*t)*x,e[8]=(o*t-n*r)*x,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-s*c,s*l,-s*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(qc.makeScale(e,t)),this}rotate(e){return this.premultiply(qc.makeRotation(-e)),this}translate(e,t){return this.premultiply(qc.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},qc=new ot;function Xu(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function ao(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function hd(){let i=ao("canvas");return i.style.display="block",i}var uf={};function vr(i){i in uf||(uf[i]=!0,console.warn(i))}function fd(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var hf=new ot().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),ff=new ot().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function gm(){let i={enabled:!0,workingColorSpace:_i,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===Tt&&(s.r=Vi(s.r),s.g=Vi(s.g),s.b=Vi(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===Tt&&(s.r=gr(s.r),s.g=gr(s.g),s.b=gr(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===ti?so:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return vr("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return vr("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[_i]:{primaries:e,whitePoint:n,transfer:so,toXYZ:hf,fromXYZ:ff,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Kt},outputColorSpaceConfig:{drawingBufferColorSpace:Kt}},[Kt]:{primaries:e,whitePoint:n,transfer:Tt,toXYZ:hf,fromXYZ:ff,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Kt}}}),i}var yt=gm();function Vi(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function gr(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var ir,Ua=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{ir===void 0&&(ir=ao("canvas")),ir.width=e.width,ir.height=e.height;let s=ir.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=ir}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=ao("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=Vi(r[o]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Vi(t[n]/255)*255):t[n]=Vi(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},xm=0,yr=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:xm++}),this.uuid=Ir(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(Yc(s[o].image)):r.push(Yc(s[o]))}else r=Yc(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function Yc(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Ua.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var vm=0,Zc=new D,Rn=class i extends Gi{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=On,s=On,r=fn,o=Qn,a=dn,l=vn,c=i.DEFAULT_ANISOTROPY,u=ti){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:vm++}),this.uuid=Ir(),this.name="",this.source=new yr(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new be(0,0),this.repeat=new be(1,1),this.center=new be(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ot,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(Zc).x}get height(){return this.source.getSize(Zc).y}get depth(){return this.source.getSize(Zc).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Nu)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case bn:e.x=e.x-Math.floor(e.x);break;case On:e.x=e.x<0?0:1;break;case Fa:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case bn:e.y=e.y-Math.floor(e.y);break;case On:e.y=e.y<0?0:1;break;case Fa:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Rn.DEFAULT_IMAGE=null;Rn.DEFAULT_MAPPING=Nu;Rn.DEFAULT_ANISOTROPY=1;var mt=class i{constructor(e=0,t=0,n=0,s=1){i.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,l=e.elements,c=l[0],u=l[4],h=l[8],f=l[1],d=l[5],g=l[9],x=l[2],p=l[6],m=l[10];if(Math.abs(u-f)<.01&&Math.abs(h-x)<.01&&Math.abs(g-p)<.01){if(Math.abs(u+f)<.1&&Math.abs(h+x)<.1&&Math.abs(g+p)<.1&&Math.abs(c+d+m-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let _=(c+1)/2,v=(d+1)/2,w=(m+1)/2,S=(u+f)/4,E=(h+x)/4,A=(g+p)/4;return _>v&&_>w?_<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(_),s=S/n,r=E/n):v>w?v<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(v),n=S/s,r=A/s):w<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(w),n=E/r,s=A/r),this.set(n,s,r,t),this}let y=Math.sqrt((p-g)*(p-g)+(h-x)*(h-x)+(f-u)*(f-u));return Math.abs(y)<.001&&(y=1),this.x=(p-g)/y,this.y=(h-x)/y,this.z=(f-u)/y,this.w=Math.acos((c+d+m-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=pt(this.x,e.x,t.x),this.y=pt(this.y,e.y,t.y),this.z=pt(this.z,e.z,t.z),this.w=pt(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=pt(this.x,e,t),this.y=pt(this.y,e,t),this.z=pt(this.z,e,t),this.w=pt(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(pt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Oa=class extends Gi{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:fn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new mt(0,0,e,t),this.scissorTest=!1,this.viewport=new mt(0,0,e,t);let s={width:e,height:t,depth:n.depth},r=new Rn(s);this.textures=[];let o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){let t={minFilter:fn,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isArrayTexture=this.textures[s].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new yr(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},Lt=class extends Oa{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},lo=class extends Rn{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Zt,this.minFilter=Zt,this.wrapR=On,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Ba=class extends Rn{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Zt,this.minFilter=Zt,this.wrapR=On,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var wi=class{constructor(e=new D(1/0,1/0,1/0),t=new D(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(gi.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(gi.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=gi.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,gi):gi.fromBufferAttribute(r,o),gi.applyMatrix4(e.matrixWorld),this.expandByPoint(gi);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ca.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),ca.copy(n.boundingBox)),ca.applyMatrix4(e.matrixWorld),this.union(ca)}let s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,gi),gi.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Yr),ua.subVectors(this.max,Yr),sr.subVectors(e.a,Yr),rr.subVectors(e.b,Yr),or.subVectors(e.c,Yr),ji.subVectors(rr,sr),Qi.subVectors(or,rr),Es.subVectors(sr,or);let t=[0,-ji.z,ji.y,0,-Qi.z,Qi.y,0,-Es.z,Es.y,ji.z,0,-ji.x,Qi.z,0,-Qi.x,Es.z,0,-Es.x,-ji.y,ji.x,0,-Qi.y,Qi.x,0,-Es.y,Es.x,0];return!Kc(t,sr,rr,or,ua)||(t=[1,0,0,0,1,0,0,0,1],!Kc(t,sr,rr,or,ua))?!1:(ha.crossVectors(ji,Qi),t=[ha.x,ha.y,ha.z],Kc(t,sr,rr,or,ua))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,gi).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(gi).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Oi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Oi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Oi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Oi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Oi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Oi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Oi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Oi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Oi),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Oi=[new D,new D,new D,new D,new D,new D,new D,new D],gi=new D,ca=new wi,sr=new D,rr=new D,or=new D,ji=new D,Qi=new D,Es=new D,Yr=new D,ua=new D,ha=new D,Ts=new D;function Kc(i,e,t,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){Ts.fromArray(i,r);let a=s.x*Math.abs(Ts.x)+s.y*Math.abs(Ts.y)+s.z*Math.abs(Ts.z),l=e.dot(Ts),c=t.dot(Ts),u=n.dot(Ts);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}var ym=new wi,Zr=new D,$c=new D,rs=class{constructor(e=new D,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):ym.setFromPoints(e).getCenter(n);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Zr.subVectors(e,this.center);let t=Zr.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(Zr,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):($c.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Zr.copy(e.center).add($c)),this.expandByPoint(Zr.copy(e.center).sub($c))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Bi=new D,Jc=new D,fa=new D,es=new D,jc=new D,da=new D,Qc=new D,co=class{constructor(e=new D,t=new D(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Bi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Bi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Bi.copy(this.origin).addScaledVector(this.direction,t),Bi.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Jc.copy(e).add(t).multiplyScalar(.5),fa.copy(t).sub(e).normalize(),es.copy(this.origin).sub(Jc);let r=e.distanceTo(t)*.5,o=-this.direction.dot(fa),a=es.dot(this.direction),l=-es.dot(fa),c=es.lengthSq(),u=Math.abs(1-o*o),h,f,d,g;if(u>0)if(h=o*l-a,f=o*a-l,g=r*u,h>=0)if(f>=-g)if(f<=g){let x=1/u;h*=x,f*=x,d=h*(h+o*f+2*a)+f*(o*h+f+2*l)+c}else f=r,h=Math.max(0,-(o*f+a)),d=-h*h+f*(f+2*l)+c;else f=-r,h=Math.max(0,-(o*f+a)),d=-h*h+f*(f+2*l)+c;else f<=-g?(h=Math.max(0,-(-o*r+a)),f=h>0?-r:Math.min(Math.max(-r,-l),r),d=-h*h+f*(f+2*l)+c):f<=g?(h=0,f=Math.min(Math.max(-r,-l),r),d=f*(f+2*l)+c):(h=Math.max(0,-(o*r+a)),f=h>0?r:Math.min(Math.max(-r,-l),r),d=-h*h+f*(f+2*l)+c);else f=o>0?-r:r,h=Math.max(0,-(o*f+a)),d=-h*h+f*(f+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,h),s&&s.copy(Jc).addScaledVector(fa,f),d}intersectSphere(e,t){Bi.subVectors(e.center,this.origin);let n=Bi.dot(this.direction),s=Bi.dot(Bi)-n*n,r=e.radius*e.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,o,a,l,c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,f=this.origin;return c>=0?(n=(e.min.x-f.x)*c,s=(e.max.x-f.x)*c):(n=(e.max.x-f.x)*c,s=(e.min.x-f.x)*c),u>=0?(r=(e.min.y-f.y)*u,o=(e.max.y-f.y)*u):(r=(e.max.y-f.y)*u,o=(e.min.y-f.y)*u),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),h>=0?(a=(e.min.z-f.z)*h,l=(e.max.z-f.z)*h):(a=(e.max.z-f.z)*h,l=(e.min.z-f.z)*h),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,Bi)!==null}intersectTriangle(e,t,n,s,r){jc.subVectors(t,e),da.subVectors(n,e),Qc.crossVectors(jc,da);let o=this.direction.dot(Qc),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;es.subVectors(this.origin,e);let l=a*this.direction.dot(da.crossVectors(es,da));if(l<0)return null;let c=a*this.direction.dot(jc.cross(es));if(c<0||l+c>o)return null;let u=-a*es.dot(Qc);return u<0?null:this.at(u/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},qe=class i{constructor(e,t,n,s,r,o,a,l,c,u,h,f,d,g,x,p){i.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c,u,h,f,d,g,x,p)}set(e,t,n,s,r,o,a,l,c,u,h,f,d,g,x,p){let m=this.elements;return m[0]=e,m[4]=t,m[8]=n,m[12]=s,m[1]=r,m[5]=o,m[9]=a,m[13]=l,m[2]=c,m[6]=u,m[10]=h,m[14]=f,m[3]=d,m[7]=g,m[11]=x,m[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,s=1/ar.setFromMatrixColumn(e,0).length(),r=1/ar.setFromMatrixColumn(e,1).length(),o=1/ar.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),h=Math.sin(r);if(e.order==="XYZ"){let f=o*u,d=o*h,g=a*u,x=a*h;t[0]=l*u,t[4]=-l*h,t[8]=c,t[1]=d+g*c,t[5]=f-x*c,t[9]=-a*l,t[2]=x-f*c,t[6]=g+d*c,t[10]=o*l}else if(e.order==="YXZ"){let f=l*u,d=l*h,g=c*u,x=c*h;t[0]=f+x*a,t[4]=g*a-d,t[8]=o*c,t[1]=o*h,t[5]=o*u,t[9]=-a,t[2]=d*a-g,t[6]=x+f*a,t[10]=o*l}else if(e.order==="ZXY"){let f=l*u,d=l*h,g=c*u,x=c*h;t[0]=f-x*a,t[4]=-o*h,t[8]=g+d*a,t[1]=d+g*a,t[5]=o*u,t[9]=x-f*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let f=o*u,d=o*h,g=a*u,x=a*h;t[0]=l*u,t[4]=g*c-d,t[8]=f*c+x,t[1]=l*h,t[5]=x*c+f,t[9]=d*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let f=o*l,d=o*c,g=a*l,x=a*c;t[0]=l*u,t[4]=x-f*h,t[8]=g*h+d,t[1]=h,t[5]=o*u,t[9]=-a*u,t[2]=-c*u,t[6]=d*h+g,t[10]=f-x*h}else if(e.order==="XZY"){let f=o*l,d=o*c,g=a*l,x=a*c;t[0]=l*u,t[4]=-h,t[8]=c*u,t[1]=f*h+x,t[5]=o*u,t[9]=d*h-g,t[2]=g*h-d,t[6]=a*u,t[10]=x*h+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(_m,e,Mm)}lookAt(e,t,n){let s=this.elements;return qn.subVectors(e,t),qn.lengthSq()===0&&(qn.z=1),qn.normalize(),ts.crossVectors(n,qn),ts.lengthSq()===0&&(Math.abs(n.z)===1?qn.x+=1e-4:qn.z+=1e-4,qn.normalize(),ts.crossVectors(n,qn)),ts.normalize(),pa.crossVectors(qn,ts),s[0]=ts.x,s[4]=pa.x,s[8]=qn.x,s[1]=ts.y,s[5]=pa.y,s[9]=qn.y,s[2]=ts.z,s[6]=pa.z,s[10]=qn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],u=n[1],h=n[5],f=n[9],d=n[13],g=n[2],x=n[6],p=n[10],m=n[14],y=n[3],_=n[7],v=n[11],w=n[15],S=s[0],E=s[4],A=s[8],b=s[12],M=s[1],R=s[5],L=s[9],U=s[13],V=s[2],X=s[6],$=s[10],K=s[14],O=s[3],j=s[7],J=s[11],F=s[15];return r[0]=o*S+a*M+l*V+c*O,r[4]=o*E+a*R+l*X+c*j,r[8]=o*A+a*L+l*$+c*J,r[12]=o*b+a*U+l*K+c*F,r[1]=u*S+h*M+f*V+d*O,r[5]=u*E+h*R+f*X+d*j,r[9]=u*A+h*L+f*$+d*J,r[13]=u*b+h*U+f*K+d*F,r[2]=g*S+x*M+p*V+m*O,r[6]=g*E+x*R+p*X+m*j,r[10]=g*A+x*L+p*$+m*J,r[14]=g*b+x*U+p*K+m*F,r[3]=y*S+_*M+v*V+w*O,r[7]=y*E+_*R+v*X+w*j,r[11]=y*A+_*L+v*$+w*J,r[15]=y*b+_*U+v*K+w*F,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],u=e[2],h=e[6],f=e[10],d=e[14],g=e[3],x=e[7],p=e[11],m=e[15];return g*(+r*l*h-s*c*h-r*a*f+n*c*f+s*a*d-n*l*d)+x*(+t*l*d-t*c*f+r*o*f-s*o*d+s*c*u-r*l*u)+p*(+t*c*h-t*a*d-r*o*h+n*o*d+r*a*u-n*c*u)+m*(-s*a*u-t*l*h+t*a*f+s*o*h-n*o*f+n*l*u)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=e[9],f=e[10],d=e[11],g=e[12],x=e[13],p=e[14],m=e[15],y=h*p*c-x*f*c+x*l*d-a*p*d-h*l*m+a*f*m,_=g*f*c-u*p*c-g*l*d+o*p*d+u*l*m-o*f*m,v=u*x*c-g*h*c+g*a*d-o*x*d-u*a*m+o*h*m,w=g*h*l-u*x*l-g*a*f+o*x*f+u*a*p-o*h*p,S=t*y+n*_+s*v+r*w;if(S===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let E=1/S;return e[0]=y*E,e[1]=(x*f*r-h*p*r-x*s*d+n*p*d+h*s*m-n*f*m)*E,e[2]=(a*p*r-x*l*r+x*s*c-n*p*c-a*s*m+n*l*m)*E,e[3]=(h*l*r-a*f*r-h*s*c+n*f*c+a*s*d-n*l*d)*E,e[4]=_*E,e[5]=(u*p*r-g*f*r+g*s*d-t*p*d-u*s*m+t*f*m)*E,e[6]=(g*l*r-o*p*r-g*s*c+t*p*c+o*s*m-t*l*m)*E,e[7]=(o*f*r-u*l*r+u*s*c-t*f*c-o*s*d+t*l*d)*E,e[8]=v*E,e[9]=(g*h*r-u*x*r-g*n*d+t*x*d+u*n*m-t*h*m)*E,e[10]=(o*x*r-g*a*r+g*n*c-t*x*c-o*n*m+t*a*m)*E,e[11]=(u*a*r-o*h*r-u*n*c+t*h*c+o*n*d-t*a*d)*E,e[12]=w*E,e[13]=(u*x*s-g*h*s+g*n*f-t*x*f-u*n*p+t*h*p)*E,e[14]=(g*a*s-o*x*s-g*n*l+t*x*l+o*n*p-t*a*p)*E,e[15]=(o*h*s-u*a*s+u*n*l-t*h*l-o*n*f+t*a*f)*E,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,o=e.x,a=e.y,l=e.z,c=r*o,u=r*a;return this.set(c*o+n,c*a-s*l,c*l+s*a,0,c*a+s*l,u*a+n,u*l-s*o,0,c*l-s*a,u*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,o){return this.set(1,n,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,u=o+o,h=a+a,f=r*c,d=r*u,g=r*h,x=o*u,p=o*h,m=a*h,y=l*c,_=l*u,v=l*h,w=n.x,S=n.y,E=n.z;return s[0]=(1-(x+m))*w,s[1]=(d+v)*w,s[2]=(g-_)*w,s[3]=0,s[4]=(d-v)*S,s[5]=(1-(f+m))*S,s[6]=(p+y)*S,s[7]=0,s[8]=(g+_)*E,s[9]=(p-y)*E,s[10]=(1-(f+x))*E,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements,r=ar.set(s[0],s[1],s[2]).length(),o=ar.set(s[4],s[5],s[6]).length(),a=ar.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],xi.copy(this);let c=1/r,u=1/o,h=1/a;return xi.elements[0]*=c,xi.elements[1]*=c,xi.elements[2]*=c,xi.elements[4]*=u,xi.elements[5]*=u,xi.elements[6]*=u,xi.elements[8]*=h,xi.elements[9]*=h,xi.elements[10]*=h,t.setFromRotationMatrix(xi),n.x=r,n.y=o,n.z=a,this}makePerspective(e,t,n,s,r,o,a=yi,l=!1){let c=this.elements,u=2*r/(t-e),h=2*r/(n-s),f=(t+e)/(t-e),d=(n+s)/(n-s),g,x;if(l)g=r/(o-r),x=o*r/(o-r);else if(a===yi)g=-(o+r)/(o-r),x=-2*o*r/(o-r);else if(a===ro)g=-o/(o-r),x=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=u,c[4]=0,c[8]=f,c[12]=0,c[1]=0,c[5]=h,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=x,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,o,a=yi,l=!1){let c=this.elements,u=2/(t-e),h=2/(n-s),f=-(t+e)/(t-e),d=-(n+s)/(n-s),g,x;if(l)g=1/(o-r),x=o/(o-r);else if(a===yi)g=-2/(o-r),x=-(o+r)/(o-r);else if(a===ro)g=-1/(o-r),x=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=u,c[4]=0,c[8]=0,c[12]=f,c[1]=0,c[5]=h,c[9]=0,c[13]=d,c[2]=0,c[6]=0,c[10]=g,c[14]=x,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},ar=new D,xi=new qe,_m=new D(0,0,0),Mm=new D(1,1,1),ts=new D,pa=new D,qn=new D,df=new qe,pf=new Ut,en=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],u=s[9],h=s[2],f=s[6],d=s[10];switch(t){case"XYZ":this._y=Math.asin(pt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,d),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-pt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin(pt(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-h,d),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-pt(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(f,d),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(pt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(a,d));break;case"XZY":this._z=Math.asin(-pt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-u,d),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return df.makeRotationFromQuaternion(e),this.setFromRotationMatrix(df,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return pf.setFromEuler(this),this.setFromQuaternion(pf,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};en.DEFAULT_ORDER="XYZ";var _r=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Sm=0,mf=new D,lr=new Ut,ki=new qe,ma=new D,Kr=new D,bm=new D,Em=new Ut,gf=new D(1,0,0),xf=new D(0,1,0),vf=new D(0,0,1),yf={type:"added"},Tm={type:"removed"},cr={type:"childadded",child:null},eu={type:"childremoved",child:null},Gt=class i extends Gi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Sm++}),this.uuid=Ir(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new D,t=new en,n=new Ut,s=new D(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new qe},normalMatrix:{value:new ot}}),this.matrix=new qe,this.matrixWorld=new qe,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new _r,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return lr.setFromAxisAngle(e,t),this.quaternion.multiply(lr),this}rotateOnWorldAxis(e,t){return lr.setFromAxisAngle(e,t),this.quaternion.premultiply(lr),this}rotateX(e){return this.rotateOnAxis(gf,e)}rotateY(e){return this.rotateOnAxis(xf,e)}rotateZ(e){return this.rotateOnAxis(vf,e)}translateOnAxis(e,t){return mf.copy(e).applyQuaternion(this.quaternion),this.position.add(mf.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(gf,e)}translateY(e){return this.translateOnAxis(xf,e)}translateZ(e){return this.translateOnAxis(vf,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(ki.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?ma.copy(e):ma.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),Kr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ki.lookAt(Kr,ma,this.up):ki.lookAt(ma,Kr,this.up),this.quaternion.setFromRotationMatrix(ki),s&&(ki.extractRotation(s.matrixWorld),lr.setFromRotationMatrix(ki),this.quaternion.premultiply(lr.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(yf),cr.child=e,this.dispatchEvent(cr),cr.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Tm),eu.child=e,this.dispatchEvent(eu),eu.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),ki.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),ki.multiply(e.parent.matrixWorld)),e.applyMatrix4(ki),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(yf),cr.child=e,this.dispatchEvent(cr),cr.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Kr,e,bm),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Kr,Em,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let h=l[c];r(e.shapes,h)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),u=o(e.images),h=o(e.shapes),f=o(e.skeletons),d=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),h.length>0&&(n.shapes=h),f.length>0&&(n.skeletons=f),d.length>0&&(n.animations=d),g.length>0&&(n.nodes=g)}return n.object=s,n;function o(a){let l=[];for(let c in a){let u=a[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}};Gt.DEFAULT_UP=new D(0,1,0);Gt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Gt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var vi=new D,Hi=new D,tu=new D,zi=new D,ur=new D,hr=new D,_f=new D,nu=new D,iu=new D,su=new D,ru=new mt,ou=new mt,au=new mt,ss=class i{constructor(e=new D,t=new D,n=new D){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),vi.subVectors(e,t),s.cross(vi);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){vi.subVectors(s,t),Hi.subVectors(n,t),tu.subVectors(e,t);let o=vi.dot(vi),a=vi.dot(Hi),l=vi.dot(tu),c=Hi.dot(Hi),u=Hi.dot(tu),h=o*c-a*a;if(h===0)return r.set(0,0,0),null;let f=1/h,d=(c*l-a*u)*f,g=(o*u-a*l)*f;return r.set(1-d-g,g,d)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,zi)===null?!1:zi.x>=0&&zi.y>=0&&zi.x+zi.y<=1}static getInterpolation(e,t,n,s,r,o,a,l){return this.getBarycoord(e,t,n,s,zi)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,zi.x),l.addScaledVector(o,zi.y),l.addScaledVector(a,zi.z),l)}static getInterpolatedAttribute(e,t,n,s,r,o){return ru.setScalar(0),ou.setScalar(0),au.setScalar(0),ru.fromBufferAttribute(e,t),ou.fromBufferAttribute(e,n),au.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(ru,r.x),o.addScaledVector(ou,r.y),o.addScaledVector(au,r.z),o}static isFrontFacing(e,t,n,s){return vi.subVectors(n,t),Hi.subVectors(e,t),vi.cross(Hi).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return vi.subVectors(this.c,this.b),Hi.subVectors(this.a,this.b),vi.cross(Hi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,o,a;ur.subVectors(s,n),hr.subVectors(r,n),nu.subVectors(e,n);let l=ur.dot(nu),c=hr.dot(nu);if(l<=0&&c<=0)return t.copy(n);iu.subVectors(e,s);let u=ur.dot(iu),h=hr.dot(iu);if(u>=0&&h<=u)return t.copy(s);let f=l*h-u*c;if(f<=0&&l>=0&&u<=0)return o=l/(l-u),t.copy(n).addScaledVector(ur,o);su.subVectors(e,r);let d=ur.dot(su),g=hr.dot(su);if(g>=0&&d<=g)return t.copy(r);let x=d*c-l*g;if(x<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(n).addScaledVector(hr,a);let p=u*g-d*h;if(p<=0&&h-u>=0&&d-g>=0)return _f.subVectors(r,s),a=(h-u)/(h-u+(d-g)),t.copy(s).addScaledVector(_f,a);let m=1/(p+x+f);return o=x*m,a=f*m,t.copy(n).addScaledVector(ur,o).addScaledVector(hr,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},dd={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ns={h:0,s:0,l:0},ga={h:0,s:0,l:0};function lu(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var we=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Kt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,yt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=yt.workingColorSpace){return this.r=e,this.g=t,this.b=n,yt.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=yt.workingColorSpace){if(e=mm(e,1),t=pt(t,0,1),n=pt(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=lu(o,r,e+1/3),this.g=lu(o,r,e),this.b=lu(o,r,e-1/3)}return yt.colorSpaceToWorking(this,s),this}setStyle(e,t=Kt){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Kt){let n=dd[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Vi(e.r),this.g=Vi(e.g),this.b=Vi(e.b),this}copyLinearToSRGB(e){return this.r=gr(e.r),this.g=gr(e.g),this.b=gr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Kt){return yt.workingToColorSpace(Sn.copy(this),e),Math.round(pt(Sn.r*255,0,255))*65536+Math.round(pt(Sn.g*255,0,255))*256+Math.round(pt(Sn.b*255,0,255))}getHexString(e=Kt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=yt.workingColorSpace){yt.workingToColorSpace(Sn.copy(this),t);let n=Sn.r,s=Sn.g,r=Sn.b,o=Math.max(n,s,r),a=Math.min(n,s,r),l,c,u=(a+o)/2;if(a===o)l=0,c=0;else{let h=o-a;switch(c=u<=.5?h/(o+a):h/(2-o-a),o){case n:l=(s-r)/h+(s<r?6:0);break;case s:l=(r-n)/h+2;break;case r:l=(n-s)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=yt.workingColorSpace){return yt.workingToColorSpace(Sn.copy(this),t),e.r=Sn.r,e.g=Sn.g,e.b=Sn.b,e}getStyle(e=Kt){yt.workingToColorSpace(Sn.copy(this),e);let t=Sn.r,n=Sn.g,s=Sn.b;return e!==Kt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(ns),this.setHSL(ns.h+e,ns.s+t,ns.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(ns),e.getHSL(ga);let n=Wc(ns.h,ga.h,t),s=Wc(ns.s,ga.s,t),r=Wc(ns.l,ga.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Sn=new we;we.NAMES=dd;var wm=0,Wi=class extends Gi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:wm++}),this.uuid=Ir(),this.name="",this.type="Material",this.blending=Ti,this.side=xn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Da,this.blendDst=La,this.blendEquation=Zn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new we(0,0,0),this.blendAlpha=0,this.depthFunc=Ps,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=_u,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Rs,this.stencilZFail=Rs,this.stencilZPass=Rs,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Ti&&(n.blending=this.blending),this.side!==xn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Da&&(n.blendSrc=this.blendSrc),this.blendDst!==La&&(n.blendDst=this.blendDst),this.blendEquation!==Zn&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Ps&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==_u&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Rs&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Rs&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Rs&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(t){let r=s(e.textures),o=s(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},Xi=class extends Wi{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new we(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new en,this.combine=Fu,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var jt=new D,xa=new be,Am=0,Ze=class{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Am++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Mu,this.updateRanges=[],this.gpuType=ei,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)xa.fromBufferAttribute(this,t),xa.applyMatrix3(e),this.setXY(t,xa.x,xa.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)jt.fromBufferAttribute(this,t),jt.applyMatrix3(e),this.setXYZ(t,jt.x,jt.y,jt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)jt.fromBufferAttribute(this,t),jt.applyMatrix4(e),this.setXYZ(t,jt.x,jt.y,jt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)jt.fromBufferAttribute(this,t),jt.applyNormalMatrix(e),this.setXYZ(t,jt.x,jt.y,jt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)jt.fromBufferAttribute(this,t),jt.transformDirection(e),this.setXYZ(t,jt.x,jt.y,jt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=qr(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Un(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=qr(t,this.array)),t}setX(e,t){return this.normalized&&(t=Un(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=qr(t,this.array)),t}setY(e,t){return this.normalized&&(t=Un(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=qr(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Un(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=qr(t,this.array)),t}setW(e,t){return this.normalized&&(t=Un(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Un(t,this.array),n=Un(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=Un(t,this.array),n=Un(n,this.array),s=Un(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=Un(t,this.array),n=Un(n,this.array),s=Un(s,this.array),r=Un(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Mu&&(e.usage=this.usage),e}};var Is=class extends Ze{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Ds=class extends Ze{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var ut=class extends Ze{constructor(e,t,n){super(new Float32Array(e),t,n)}},Rm=0,ci=new qe,cu=new Gt,fr=new D,Yn=new wi,$r=new wi,hn=new D,ft=class i extends Gi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Rm++}),this.uuid=Ir(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Xu(e)?Ds:Is)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new ot().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return ci.makeRotationFromQuaternion(e),this.applyMatrix4(ci),this}rotateX(e){return ci.makeRotationX(e),this.applyMatrix4(ci),this}rotateY(e){return ci.makeRotationY(e),this.applyMatrix4(ci),this}rotateZ(e){return ci.makeRotationZ(e),this.applyMatrix4(ci),this}translate(e,t,n){return ci.makeTranslation(e,t,n),this.applyMatrix4(ci),this}scale(e,t,n){return ci.makeScale(e,t,n),this.applyMatrix4(ci),this}lookAt(e){return cu.lookAt(e),cu.updateMatrix(),this.applyMatrix4(cu.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(fr).negate(),this.translate(fr.x,fr.y,fr.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let o=e[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new ut(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new wi);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new D(-1/0,-1/0,-1/0),new D(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];Yn.setFromBufferAttribute(r),this.morphTargetsRelative?(hn.addVectors(this.boundingBox.min,Yn.min),this.boundingBox.expandByPoint(hn),hn.addVectors(this.boundingBox.max,Yn.max),this.boundingBox.expandByPoint(hn)):(this.boundingBox.expandByPoint(Yn.min),this.boundingBox.expandByPoint(Yn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new rs);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new D,1/0);return}if(e){let n=this.boundingSphere.center;if(Yn.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){let a=t[r];$r.setFromBufferAttribute(a),this.morphTargetsRelative?(hn.addVectors(Yn.min,$r.min),Yn.expandByPoint(hn),hn.addVectors(Yn.max,$r.max),Yn.expandByPoint(hn)):(Yn.expandByPoint($r.min),Yn.expandByPoint($r.max))}Yn.getCenter(n);let s=0;for(let r=0,o=e.count;r<o;r++)hn.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(hn));if(t)for(let r=0,o=t.length;r<o;r++){let a=t[r],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)hn.fromBufferAttribute(a,c),l&&(fr.fromBufferAttribute(e,c),hn.add(fr)),s=Math.max(s,n.distanceToSquared(hn))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Ze(new Float32Array(4*n.count),4));let o=this.getAttribute("tangent"),a=[],l=[];for(let A=0;A<n.count;A++)a[A]=new D,l[A]=new D;let c=new D,u=new D,h=new D,f=new be,d=new be,g=new be,x=new D,p=new D;function m(A,b,M){c.fromBufferAttribute(n,A),u.fromBufferAttribute(n,b),h.fromBufferAttribute(n,M),f.fromBufferAttribute(r,A),d.fromBufferAttribute(r,b),g.fromBufferAttribute(r,M),u.sub(c),h.sub(c),d.sub(f),g.sub(f);let R=1/(d.x*g.y-g.x*d.y);isFinite(R)&&(x.copy(u).multiplyScalar(g.y).addScaledVector(h,-d.y).multiplyScalar(R),p.copy(h).multiplyScalar(d.x).addScaledVector(u,-g.x).multiplyScalar(R),a[A].add(x),a[b].add(x),a[M].add(x),l[A].add(p),l[b].add(p),l[M].add(p))}let y=this.groups;y.length===0&&(y=[{start:0,count:e.count}]);for(let A=0,b=y.length;A<b;++A){let M=y[A],R=M.start,L=M.count;for(let U=R,V=R+L;U<V;U+=3)m(e.getX(U+0),e.getX(U+1),e.getX(U+2))}let _=new D,v=new D,w=new D,S=new D;function E(A){w.fromBufferAttribute(s,A),S.copy(w);let b=a[A];_.copy(b),_.sub(w.multiplyScalar(w.dot(b))).normalize(),v.crossVectors(S,b);let R=v.dot(l[A])<0?-1:1;o.setXYZW(A,_.x,_.y,_.z,R)}for(let A=0,b=y.length;A<b;++A){let M=y[A],R=M.start,L=M.count;for(let U=R,V=R+L;U<V;U+=3)E(e.getX(U+0)),E(e.getX(U+1)),E(e.getX(U+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Ze(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let f=0,d=n.count;f<d;f++)n.setXYZ(f,0,0,0);let s=new D,r=new D,o=new D,a=new D,l=new D,c=new D,u=new D,h=new D;if(e)for(let f=0,d=e.count;f<d;f+=3){let g=e.getX(f+0),x=e.getX(f+1),p=e.getX(f+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,x),o.fromBufferAttribute(t,p),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,x),c.fromBufferAttribute(n,p),a.add(u),l.add(u),c.add(u),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(x,l.x,l.y,l.z),n.setXYZ(p,c.x,c.y,c.z)}else for(let f=0,d=t.count;f<d;f+=3)s.fromBufferAttribute(t,f+0),r.fromBufferAttribute(t,f+1),o.fromBufferAttribute(t,f+2),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),n.setXYZ(f+0,u.x,u.y,u.z),n.setXYZ(f+1,u.x,u.y,u.z),n.setXYZ(f+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)hn.fromBufferAttribute(e,t),hn.normalize(),e.setXYZ(t,hn.x,hn.y,hn.z)}toNonIndexed(){function e(a,l){let c=a.array,u=a.itemSize,h=a.normalized,f=new c.constructor(l.length*u),d=0,g=0;for(let x=0,p=l.length;x<p;x++){a.isInterleavedBufferAttribute?d=l[x]*a.data.stride+a.offset:d=l[x]*u;for(let m=0;m<u;m++)f[g++]=c[d++]}return new Ze(f,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let a in s){let l=s[a],c=e(l,n);t.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let u=0,h=c.length;u<h;u++){let f=c[u],d=e(f,n);l.push(d)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let h=0,f=c.length;h<f;h++){let d=c[h];u.push(d.toJSON(e.data))}u.length>0&&(s[l]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let c in s){let u=s[c];this.setAttribute(c,u.clone(t))}let r=e.morphAttributes;for(let c in r){let u=[],h=r[c];for(let f=0,d=h.length;f<d;f++)u.push(h[f].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,u=o.length;c<u;c++){let h=o[c];this.addGroup(h.start,h.count,h.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},Mf=new qe,ws=new co,va=new rs,Sf=new D,ya=new D,_a=new D,Ma=new D,uu=new D,Sa=new D,bf=new D,ba=new D,$e=class extends Gt{constructor(e=new ft,t=new Xi){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let a=this.morphTargetInfluences;if(r&&a){Sa.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let u=a[l],h=r[l];u!==0&&(uu.fromBufferAttribute(h,e),o?Sa.addScaledVector(uu,u):Sa.addScaledVector(uu.sub(t),u))}t.add(Sa)}return t}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),va.copy(n.boundingSphere),va.applyMatrix4(r),ws.copy(e.ray).recast(e.near),!(va.containsPoint(ws.origin)===!1&&(ws.intersectSphere(va,Sf)===null||ws.origin.distanceToSquared(Sf)>(e.far-e.near)**2))&&(Mf.copy(r).invert(),ws.copy(e.ray).applyMatrix4(Mf),!(n.boundingBox!==null&&ws.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,ws)))}_computeIntersections(e,t,n){let s,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,h=r.attributes.normal,f=r.groups,d=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,x=f.length;g<x;g++){let p=f[g],m=o[p.materialIndex],y=Math.max(p.start,d.start),_=Math.min(a.count,Math.min(p.start+p.count,d.start+d.count));for(let v=y,w=_;v<w;v+=3){let S=a.getX(v),E=a.getX(v+1),A=a.getX(v+2);s=Ea(this,m,e,n,c,u,h,S,E,A),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=p.materialIndex,t.push(s))}}else{let g=Math.max(0,d.start),x=Math.min(a.count,d.start+d.count);for(let p=g,m=x;p<m;p+=3){let y=a.getX(p),_=a.getX(p+1),v=a.getX(p+2);s=Ea(this,o,e,n,c,u,h,y,_,v),s&&(s.faceIndex=Math.floor(p/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,x=f.length;g<x;g++){let p=f[g],m=o[p.materialIndex],y=Math.max(p.start,d.start),_=Math.min(l.count,Math.min(p.start+p.count,d.start+d.count));for(let v=y,w=_;v<w;v+=3){let S=v,E=v+1,A=v+2;s=Ea(this,m,e,n,c,u,h,S,E,A),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=p.materialIndex,t.push(s))}}else{let g=Math.max(0,d.start),x=Math.min(l.count,d.start+d.count);for(let p=g,m=x;p<m;p+=3){let y=p,_=p+1,v=p+2;s=Ea(this,o,e,n,c,u,h,y,_,v),s&&(s.faceIndex=Math.floor(p/3),t.push(s))}}}};function Cm(i,e,t,n,s,r,o,a){let l;if(e.side===rn?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,e.side===xn,a),l===null)return null;ba.copy(a),ba.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(ba);return c<t.near||c>t.far?null:{distance:c,point:ba.clone(),object:i}}function Ea(i,e,t,n,s,r,o,a,l,c){i.getVertexPosition(a,ya),i.getVertexPosition(l,_a),i.getVertexPosition(c,Ma);let u=Cm(i,e,t,n,ya,_a,Ma,bf);if(u){let h=new D;ss.getBarycoord(bf,ya,_a,Ma,h),s&&(u.uv=ss.getInterpolatedAttribute(s,a,l,c,h,new be)),r&&(u.uv1=ss.getInterpolatedAttribute(r,a,l,c,h,new be)),o&&(u.normal=ss.getInterpolatedAttribute(o,a,l,c,h,new D),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let f={a,b:l,c,normal:new D,materialIndex:0};ss.getNormal(ya,_a,Ma,f.normal),u.face=f,u.barycoord=h}return u}var os=class i extends ft{constructor(e=1,t=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],u=[],h=[],f=0,d=0;g("z","y","x",-1,-1,n,t,e,o,r,0),g("z","y","x",1,-1,n,t,-e,o,r,1),g("x","z","y",1,1,e,n,t,s,o,2),g("x","z","y",1,-1,e,n,-t,s,o,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new ut(c,3)),this.setAttribute("normal",new ut(u,3)),this.setAttribute("uv",new ut(h,2));function g(x,p,m,y,_,v,w,S,E,A,b){let M=v/E,R=w/A,L=v/2,U=w/2,V=S/2,X=E+1,$=A+1,K=0,O=0,j=new D;for(let J=0;J<$;J++){let F=J*R-U;for(let ie=0;ie<X;ie++){let pe=ie*M-L;j[x]=pe*y,j[p]=F*_,j[m]=V,c.push(j.x,j.y,j.z),j[x]=0,j[p]=0,j[m]=S>0?1:-1,u.push(j.x,j.y,j.z),h.push(ie/E),h.push(1-J/A),K+=1}}for(let J=0;J<A;J++)for(let F=0;F<E;F++){let ie=f+F+X*J,pe=f+F+X*(J+1),ge=f+(F+1)+X*(J+1),oe=f+(F+1)+X*J;l.push(ie,pe,oe),l.push(pe,ge,oe),O+=6}a.addGroup(d,O,b),d+=O,f+=K}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function qs(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone():Array.isArray(s)?e[t][n]=s.slice():e[t][n]=s}}return e}function En(i){let e={};for(let t=0;t<i.length;t++){let n=qs(i[t]);for(let s in n)e[s]=n[s]}return e}function Pm(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function qu(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:yt.workingColorSpace}var Cn={clone:qs,merge:En},Im=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Dm=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,dt=class extends Wi{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Im,this.fragmentShader=Dm,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=qs(e.uniforms),this.uniformsGroups=Pm(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},uo=class extends Gt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new qe,this.projectionMatrix=new qe,this.projectionMatrixInverse=new qe,this.coordinateSystem=yi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},is=new D,Ef=new be,Tf=new be,Qt=class extends uo{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=oo*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Gc*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return oo*2*Math.atan(Math.tan(Gc*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){is.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(is.x,is.y).multiplyScalar(-e/is.z),is.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(is.x,is.y).multiplyScalar(-e/is.z)}getViewSize(e,t){return this.getViewBounds(e,Ef,Tf),t.subVectors(Tf,Ef)}setViewOffset(e,t,n,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Gc*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*n/c,s*=o.width/l,n*=o.height/c}let a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},dr=-90,pr=1,ka=class extends Gt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Qt(dr,pr,e,t);s.layers=this.layers,this.add(s);let r=new Qt(dr,pr,e,t);r.layers=this.layers,this.add(r);let o=new Qt(dr,pr,e,t);o.layers=this.layers,this.add(o);let a=new Qt(dr,pr,e,t);a.layers=this.layers,this.add(a);let l=new Qt(dr,pr,e,t);l.layers=this.layers,this.add(l);let c=new Qt(dr,pr,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,o,a,l]=t;for(let c of t)this.remove(c);if(e===yi)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===ro)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,u]=this.children,h=e.getRenderTarget(),f=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let x=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,s),e.render(t,r),e.setRenderTarget(n,1,s),e.render(t,o),e.setRenderTarget(n,2,s),e.render(t,a),e.setRenderTarget(n,3,s),e.render(t,l),e.setRenderTarget(n,4,s),e.render(t,c),n.texture.generateMipmaps=x,e.setRenderTarget(n,5,s),e.render(t,u),e.setRenderTarget(h,f,d),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},ho=class extends Rn{constructor(e=[],t=Ws,n,s,r,o,a,l,c,u){super(e,t,n,s,r,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Ha=class extends Lt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new ho(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new os(5,5,5),r=new dt({name:"CubemapFromEquirect",uniforms:qs(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:rn,blending:tn});r.uniforms.tEquirect.value=t;let o=new $e(s,r),a=t.minFilter;return t.minFilter===Qn&&(t.minFilter=fn),new ka(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,s);e.setRenderTarget(r)}},at=class extends Gt{constructor(){super(),this.isGroup=!0,this.type="Group"}},Lm={type:"move"},Mr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new at,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new at,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new D,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new D),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new at,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new D,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new D),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let x of e.hand.values()){let p=t.getJointPose(x,n),m=this._getHandJoint(c,x);p!==null&&(m.matrix.fromArray(p.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=p.radius),m.visible=p!==null}let u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],f=u.position.distanceTo(h.position),d=.02,g=.005;c.inputState.pinching&&f>d+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&f<=d-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Lm)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new at;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},fo=class i{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new we(e),this.density=t}clone(){return new i(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}};var po=class extends Gt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new en,this.environmentIntensity=1,this.environmentRotation=new en,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}};var ui=class extends Rn{constructor(e=null,t=1,n=1,s,r,o,a,l,c=Zt,u=Zt,h,f){super(null,o,a,l,c,u,s,r,h,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var mo=class extends Ze{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},mr=new qe,wf=new qe,Ta=[],Af=new wi,Fm=new qe,Jr=new $e,jr=new rs,Ls=class extends $e{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new mo(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,Fm)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new wi),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,mr),Af.copy(e.boundingBox).applyMatrix4(mr),this.boundingBox.union(Af)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new rs),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,mr),jr.copy(e.boundingSphere).applyMatrix4(mr),this.boundingSphere.union(jr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=e*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(e,t){let n=this.matrixWorld,s=this.count;if(Jr.geometry=this.geometry,Jr.material=this.material,Jr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),jr.copy(this.boundingSphere),jr.applyMatrix4(n),e.ray.intersectsSphere(jr)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,mr),wf.multiplyMatrices(n,mr),Jr.matrixWorld=wf,Jr.raycast(e,Ta);for(let o=0,a=Ta.length;o<a;o++){let l=Ta[o];l.instanceId=r,l.object=this,t.push(l)}Ta.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new mo(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){let n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new ui(new Float32Array(s*this.count),s,this.count,El,ei));let r=this.morphTexture.source.data.data,o=0;for(let c=0;c<n.length;c++)o+=n[c];let a=this.geometry.morphTargetsRelative?1:1-o,l=s*e;r[l]=a,r.set(n,l+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},hu=new D,Nm=new D,Um=new ot,An=class{constructor(e=new D(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=hu.subVectors(n,t).cross(Nm.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(hu),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Um.getNormalMatrix(e),s=this.coplanarPoint(hu).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},As=new rs,Om=new be(.5,.5),wa=new D,Sr=class{constructor(e=new An,t=new An,n=new An,s=new An,r=new An,o=new An){this.planes=[e,t,n,s,r,o]}set(e,t,n,s,r,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=yi,n=!1){let s=this.planes,r=e.elements,o=r[0],a=r[1],l=r[2],c=r[3],u=r[4],h=r[5],f=r[6],d=r[7],g=r[8],x=r[9],p=r[10],m=r[11],y=r[12],_=r[13],v=r[14],w=r[15];if(s[0].setComponents(c-o,d-u,m-g,w-y).normalize(),s[1].setComponents(c+o,d+u,m+g,w+y).normalize(),s[2].setComponents(c+a,d+h,m+x,w+_).normalize(),s[3].setComponents(c-a,d-h,m-x,w-_).normalize(),n)s[4].setComponents(l,f,p,v).normalize(),s[5].setComponents(c-l,d-f,m-p,w-v).normalize();else if(s[4].setComponents(c-l,d-f,m-p,w-v).normalize(),t===yi)s[5].setComponents(c+l,d+f,m+p,w+v).normalize();else if(t===ro)s[5].setComponents(l,f,p,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),As.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),As.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(As)}intersectsSprite(e){As.center.set(0,0,0);let t=Om.distanceTo(e.center);return As.radius=.7071067811865476+t,As.applyMatrix4(e.matrixWorld),this.intersectsSphere(As)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(wa.x=s.normal.x>0?e.max.x:e.min.x,wa.y=s.normal.y>0?e.max.y:e.min.y,wa.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(wa)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var as=class extends Rn{constructor(e,t,n,s,r,o,a,l,c){super(e,t,n,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},Fs=class extends Rn{constructor(e,t,n=ds,s,r,o,a=Zt,l=Zt,c,u=xr,h=1){if(u!==xr&&u!==ms)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let f={width:e,height:t,depth:h};super(f,s,r,o,a,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new yr(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},go=class extends Rn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}};var Bn=class i extends ft{constructor(e=1,t=1,n=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let u=[],h=[],f=[],d=[],g=0,x=[],p=n/2,m=0;y(),o===!1&&(e>0&&_(!0),t>0&&_(!1)),this.setIndex(u),this.setAttribute("position",new ut(h,3)),this.setAttribute("normal",new ut(f,3)),this.setAttribute("uv",new ut(d,2));function y(){let v=new D,w=new D,S=0,E=(t-e)/n;for(let A=0;A<=r;A++){let b=[],M=A/r,R=M*(t-e)+e;for(let L=0;L<=s;L++){let U=L/s,V=U*l+a,X=Math.sin(V),$=Math.cos(V);w.x=R*X,w.y=-M*n+p,w.z=R*$,h.push(w.x,w.y,w.z),v.set(X,E,$).normalize(),f.push(v.x,v.y,v.z),d.push(U,1-M),b.push(g++)}x.push(b)}for(let A=0;A<s;A++)for(let b=0;b<r;b++){let M=x[b][A],R=x[b+1][A],L=x[b+1][A+1],U=x[b][A+1];(e>0||b!==0)&&(u.push(M,R,U),S+=3),(t>0||b!==r-1)&&(u.push(R,L,U),S+=3)}c.addGroup(m,S,0),m+=S}function _(v){let w=g,S=new be,E=new D,A=0,b=v===!0?e:t,M=v===!0?1:-1;for(let L=1;L<=s;L++)h.push(0,p*M,0),f.push(0,M,0),d.push(.5,.5),g++;let R=g;for(let L=0;L<=s;L++){let V=L/s*l+a,X=Math.cos(V),$=Math.sin(V);E.x=b*$,E.y=p*M,E.z=b*X,h.push(E.x,E.y,E.z),f.push(0,M,0),S.x=X*.5+.5,S.y=$*.5*M+.5,d.push(S.x,S.y),g++}for(let L=0;L<s;L++){let U=w+L,V=R+L;v===!0?u.push(V,V+1,U):u.push(V+1,V,U),A+=3}c.addGroup(m,A,v===!0?1:2),m+=A}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var Kn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){console.warn("THREE.Curve: .getPoint() not implemented.")}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,s=this.getPoint(0),r=0;t.push(0);for(let o=1;o<=e;o++)n=this.getPoint(o/e),r+=n.distanceTo(s),t.push(r),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),s=0,r=n.length,o;t?o=t:o=e*n[r-1];let a=0,l=r-1,c;for(;a<=l;)if(s=Math.floor(a+(l-a)/2),c=n[s]-o,c<0)a=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===o)return s/(r-1);let u=n[s],f=n[s+1]-u,d=(o-u)/f;return(s+d)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);let o=this.getPoint(s),a=this.getPoint(r),l=t||(o.isVector2?new be:new D);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new D,s=[],r=[],o=[],a=new D,l=new qe;for(let d=0;d<=e;d++){let g=d/e;s[d]=this.getTangentAt(g,new D)}r[0]=new D,o[0]=new D;let c=Number.MAX_VALUE,u=Math.abs(s[0].x),h=Math.abs(s[0].y),f=Math.abs(s[0].z);u<=c&&(c=u,n.set(1,0,0)),h<=c&&(c=h,n.set(0,1,0)),f<=c&&n.set(0,0,1),a.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let d=1;d<=e;d++){if(r[d]=r[d-1].clone(),o[d]=o[d-1].clone(),a.crossVectors(s[d-1],s[d]),a.length()>Number.EPSILON){a.normalize();let g=Math.acos(pt(s[d-1].dot(s[d]),-1,1));r[d].applyMatrix4(l.makeRotationAxis(a,g))}o[d].crossVectors(s[d],r[d])}if(t===!0){let d=Math.acos(pt(r[0].dot(r[e]),-1,1));d/=e,s[0].dot(a.crossVectors(r[0],r[e]))>0&&(d=-d);for(let g=1;g<=e;g++)r[g].applyMatrix4(l.makeRotationAxis(s[g],d*g)),o[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},br=class extends Kn{constructor(e=0,t=0,n=1,s=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t=new be){let n=t,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);let a=this.aStartAngle+e*r,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let u=Math.cos(this.aRotation),h=Math.sin(this.aRotation),f=l-this.aX,d=c-this.aY;l=f*u-d*h+this.aX,c=f*h+d*u+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},za=class extends br{constructor(e,t,n,s,r,o){super(e,t,n,n,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}};function Yu(){let i=0,e=0,t=0,n=0;function s(r,o,a,l){i=r,e=a,t=-3*r+3*o-2*a-l,n=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){s(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,u,h){let f=(o-r)/c-(a-r)/(c+u)+(a-o)/u,d=(a-o)/u-(l-o)/(u+h)+(l-a)/h;f*=u,d*=u,s(o,a,f,d)},calc:function(r){let o=r*r,a=o*r;return i+e*r+t*o+n*a}}}var Aa=new D,fu=new Yu,du=new Yu,pu=new Yu,Ai=class extends Kn{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new D){let n=t,s=this.points,r=s.length,o=(r-(this.closed?0:1))*e,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,u;this.closed||a>0?c=s[(a-1)%r]:(Aa.subVectors(s[0],s[1]).add(s[0]),c=Aa);let h=s[a%r],f=s[(a+1)%r];if(this.closed||a+2<r?u=s[(a+2)%r]:(Aa.subVectors(s[r-1],s[r-2]).add(s[r-1]),u=Aa),this.curveType==="centripetal"||this.curveType==="chordal"){let d=this.curveType==="chordal"?.5:.25,g=Math.pow(c.distanceToSquared(h),d),x=Math.pow(h.distanceToSquared(f),d),p=Math.pow(f.distanceToSquared(u),d);x<1e-4&&(x=1),g<1e-4&&(g=x),p<1e-4&&(p=x),fu.initNonuniformCatmullRom(c.x,h.x,f.x,u.x,g,x,p),du.initNonuniformCatmullRom(c.y,h.y,f.y,u.y,g,x,p),pu.initNonuniformCatmullRom(c.z,h.z,f.z,u.z,g,x,p)}else this.curveType==="catmullrom"&&(fu.initCatmullRom(c.x,h.x,f.x,u.x,this.tension),du.initCatmullRom(c.y,h.y,f.y,u.y,this.tension),pu.initCatmullRom(c.z,h.z,f.z,u.z,this.tension));return n.set(fu.calc(l),du.calc(l),pu.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new D().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Rf(i,e,t,n,s){let r=(n-e)*.5,o=(s-t)*.5,a=i*i,l=i*a;return(2*t-2*n+r+o)*l+(-3*t+3*n-2*r-o)*a+r*i+t}function Bm(i,e){let t=1-i;return t*t*e}function km(i,e){return 2*(1-i)*i*e}function Hm(i,e){return i*i*e}function to(i,e,t,n){return Bm(i,e)+km(i,t)+Hm(i,n)}function zm(i,e){let t=1-i;return t*t*t*e}function Vm(i,e){let t=1-i;return 3*t*t*i*e}function Gm(i,e){return 3*(1-i)*i*i*e}function Wm(i,e){return i*i*i*e}function no(i,e,t,n,s){return zm(i,e)+Vm(i,t)+Gm(i,n)+Wm(i,s)}var xo=class extends Kn{constructor(e=new be,t=new be,n=new be,s=new be){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new be){let n=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(no(e,s.x,r.x,o.x,a.x),no(e,s.y,r.y,o.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Va=class extends Kn{constructor(e=new D,t=new D,n=new D,s=new D){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new D){let n=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(no(e,s.x,r.x,o.x,a.x),no(e,s.y,r.y,o.y,a.y),no(e,s.z,r.z,o.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},vo=class extends Kn{constructor(e=new be,t=new be){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new be){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new be){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ga=class extends Kn{constructor(e=new D,t=new D){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new D){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new D){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},yo=class extends Kn{constructor(e=new be,t=new be,n=new be){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new be){let n=t,s=this.v0,r=this.v1,o=this.v2;return n.set(to(e,s.x,r.x,o.x),to(e,s.y,r.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},_o=class extends Kn{constructor(e=new D,t=new D,n=new D){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new D){let n=t,s=this.v0,r=this.v1,o=this.v2;return n.set(to(e,s.x,r.x,o.x),to(e,s.y,r.y,o.y),to(e,s.z,r.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Mo=class extends Kn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new be){let n=t,s=this.points,r=(s.length-1)*e,o=Math.floor(r),a=r-o,l=s[o===0?o:o-1],c=s[o],u=s[o>s.length-2?s.length-1:o+1],h=s[o>s.length-3?s.length-1:o+2];return n.set(Rf(a,l.x,c.x,u.x,h.x),Rf(a,l.y,c.y,u.y,h.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new be().fromArray(s))}return this}},Wa=Object.freeze({__proto__:null,ArcCurve:za,CatmullRomCurve3:Ai,CubicBezierCurve:xo,CubicBezierCurve3:Va,EllipseCurve:br,LineCurve:vo,LineCurve3:Ga,QuadraticBezierCurve:yo,QuadraticBezierCurve3:_o,SplineCurve:Mo}),Xa=class extends Kn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Wa[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=n){let o=s[r]-n,a=this.curves[r],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}r++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,s=this.curves.length;n<s;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let s=0,r=this.curves;s<r.length;s++){let o=r[s],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){let u=l[c];n&&n.equals(u)||(t.push(u),n=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let s=e.curves[t];this.curves.push(new Wa[s.type]().fromJSON(s))}return this}},Ns=class extends Xa{constructor(e){super(),this.type="Path",this.currentPoint=new be,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new vo(this.currentPoint.clone(),new be(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,s){let r=new yo(this.currentPoint.clone(),new be(e,t),new be(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(e,t,n,s,r,o){let a=new xo(this.currentPoint.clone(),new be(e,t),new be(n,s),new be(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),n=new Mo(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,s,r,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,n,s,r,o),this}absarc(e,t,n,s,r,o){return this.absellipse(e,t,n,n,s,r,o),this}ellipse(e,t,n,s,r,o,a,l){let c=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+c,t+u,n,s,r,o,a,l),this}absellipse(e,t,n,s,r,o,a,l){let c=new br(e,t,n,s,r,o,a,l);if(this.curves.length>0){let h=c.getPoint(0);h.equals(this.currentPoint)||this.lineTo(h.x,h.y)}this.curves.push(c);let u=c.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},ls=class extends Ns{constructor(e){super(e),this.uuid=Ir(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,s=this.holes.length;n<s;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let s=e.holes[t];this.holes.push(new Ns().fromJSON(s))}return this}};function Xm(i,e,t=2){let n=e&&e.length,s=n?e[0]*t:i.length,r=pd(i,0,s,t,!0),o=[];if(!r||r.next===r.prev)return o;let a,l,c;if(n&&(r=$m(i,e,r,t)),i.length>80*t){a=1/0,l=1/0;let u=-1/0,h=-1/0;for(let f=t;f<s;f+=t){let d=i[f],g=i[f+1];d<a&&(a=d),g<l&&(l=g),d>u&&(u=d),g>h&&(h=g)}c=Math.max(u-a,h-l),c=c!==0?32767/c:0}return So(r,o,t,a,l,c,0),o}function pd(i,e,t,n,s){let r;if(s===ag(i,e,t,n)>0)for(let o=e;o<t;o+=n)r=Cf(o/n|0,i[o],i[o+1],r);else for(let o=t-n;o>=e;o-=n)r=Cf(o/n|0,i[o],i[o+1],r);return r&&Er(r,r.next)&&(Eo(r),r=r.next),r}function Us(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(Er(t,t.next)||Vt(t.prev,t,t.next)===0)){if(Eo(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function So(i,e,t,n,s,r,o){if(!i)return;!o&&r&&tg(i,n,s,r);let a=i;for(;i.prev!==i.next;){let l=i.prev,c=i.next;if(r?Ym(i,n,s,r):qm(i)){e.push(l.i,i.i,c.i),Eo(i),i=c.next,a=c.next;continue}if(i=c,i===a){o?o===1?(i=Zm(Us(i),e),So(i,e,t,n,s,r,2)):o===2&&Km(i,e,t,n,s,r):So(Us(i),e,t,n,s,r,1);break}}}function qm(i){let e=i.prev,t=i,n=i.next;if(Vt(e,t,n)>=0)return!1;let s=e.x,r=t.x,o=n.x,a=e.y,l=t.y,c=n.y,u=Math.min(s,r,o),h=Math.min(a,l,c),f=Math.max(s,r,o),d=Math.max(a,l,c),g=n.next;for(;g!==e;){if(g.x>=u&&g.x<=f&&g.y>=h&&g.y<=d&&eo(s,a,r,l,o,c,g.x,g.y)&&Vt(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function Ym(i,e,t,n){let s=i.prev,r=i,o=i.next;if(Vt(s,r,o)>=0)return!1;let a=s.x,l=r.x,c=o.x,u=s.y,h=r.y,f=o.y,d=Math.min(a,l,c),g=Math.min(u,h,f),x=Math.max(a,l,c),p=Math.max(u,h,f),m=Su(d,g,e,t,n),y=Su(x,p,e,t,n),_=i.prevZ,v=i.nextZ;for(;_&&_.z>=m&&v&&v.z<=y;){if(_.x>=d&&_.x<=x&&_.y>=g&&_.y<=p&&_!==s&&_!==o&&eo(a,u,l,h,c,f,_.x,_.y)&&Vt(_.prev,_,_.next)>=0||(_=_.prevZ,v.x>=d&&v.x<=x&&v.y>=g&&v.y<=p&&v!==s&&v!==o&&eo(a,u,l,h,c,f,v.x,v.y)&&Vt(v.prev,v,v.next)>=0))return!1;v=v.nextZ}for(;_&&_.z>=m;){if(_.x>=d&&_.x<=x&&_.y>=g&&_.y<=p&&_!==s&&_!==o&&eo(a,u,l,h,c,f,_.x,_.y)&&Vt(_.prev,_,_.next)>=0)return!1;_=_.prevZ}for(;v&&v.z<=y;){if(v.x>=d&&v.x<=x&&v.y>=g&&v.y<=p&&v!==s&&v!==o&&eo(a,u,l,h,c,f,v.x,v.y)&&Vt(v.prev,v,v.next)>=0)return!1;v=v.nextZ}return!0}function Zm(i,e){let t=i;do{let n=t.prev,s=t.next.next;!Er(n,s)&&gd(n,t,t.next,s)&&bo(n,s)&&bo(s,n)&&(e.push(n.i,t.i,s.i),Eo(t),Eo(t.next),t=i=s),t=t.next}while(t!==i);return Us(t)}function Km(i,e,t,n,s,r){let o=i;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&sg(o,a)){let l=xd(o,a);o=Us(o,o.next),l=Us(l,l.next),So(o,e,t,n,s,r,0),So(l,e,t,n,s,r,0);return}a=a.next}o=o.next}while(o!==i)}function $m(i,e,t,n){let s=[];for(let r=0,o=e.length;r<o;r++){let a=e[r]*n,l=r<o-1?e[r+1]*n:i.length,c=pd(i,a,l,n,!1);c===c.next&&(c.steiner=!0),s.push(ig(c))}s.sort(Jm);for(let r=0;r<s.length;r++)t=jm(s[r],t);return t}function Jm(i,e){let t=i.x-e.x;if(t===0&&(t=i.y-e.y,t===0)){let n=(i.next.y-i.y)/(i.next.x-i.x),s=(e.next.y-e.y)/(e.next.x-e.x);t=n-s}return t}function jm(i,e){let t=Qm(i,e);if(!t)return e;let n=xd(t,i);return Us(n,n.next),Us(t,t.next)}function Qm(i,e){let t=e,n=i.x,s=i.y,r=-1/0,o;if(Er(i,t))return t;do{if(Er(i,t.next))return t.next;if(s<=t.y&&s>=t.next.y&&t.next.y!==t.y){let h=t.x+(s-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(h<=n&&h>r&&(r=h,o=t.x<t.next.x?t:t.next,h===n))return o}t=t.next}while(t!==e);if(!o)return null;let a=o,l=o.x,c=o.y,u=1/0;t=o;do{if(n>=t.x&&t.x>=l&&n!==t.x&&md(s<c?n:r,s,l,c,s<c?r:n,s,t.x,t.y)){let h=Math.abs(s-t.y)/(n-t.x);bo(t,i)&&(h<u||h===u&&(t.x>o.x||t.x===o.x&&eg(o,t)))&&(o=t,u=h)}t=t.next}while(t!==a);return o}function eg(i,e){return Vt(i.prev,i,e.prev)<0&&Vt(e.next,i,i.next)<0}function tg(i,e,t,n){let s=i;do s.z===0&&(s.z=Su(s.x,s.y,e,t,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,ng(s)}function ng(i){let e,t=1;do{let n=i,s;i=null;let r=null;for(e=0;n;){e++;let o=n,a=0;for(let c=0;c<t&&(a++,o=o.nextZ,!!o);c++);let l=t;for(;a>0||l>0&&o;)a!==0&&(l===0||!o||n.z<=o.z)?(s=n,n=n.nextZ,a--):(s=o,o=o.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=o}r.nextZ=null,t*=2}while(e>1);return i}function Su(i,e,t,n,s){return i=(i-t)*s|0,e=(e-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function ig(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function md(i,e,t,n,s,r,o,a){return(s-o)*(e-a)>=(i-o)*(r-a)&&(i-o)*(n-a)>=(t-o)*(e-a)&&(t-o)*(r-a)>=(s-o)*(n-a)}function eo(i,e,t,n,s,r,o,a){return!(i===o&&e===a)&&md(i,e,t,n,s,r,o,a)}function sg(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!rg(i,e)&&(bo(i,e)&&bo(e,i)&&og(i,e)&&(Vt(i.prev,i,e.prev)||Vt(i,e.prev,e))||Er(i,e)&&Vt(i.prev,i,i.next)>0&&Vt(e.prev,e,e.next)>0)}function Vt(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function Er(i,e){return i.x===e.x&&i.y===e.y}function gd(i,e,t,n){let s=Ca(Vt(i,e,t)),r=Ca(Vt(i,e,n)),o=Ca(Vt(t,n,i)),a=Ca(Vt(t,n,e));return!!(s!==r&&o!==a||s===0&&Ra(i,t,e)||r===0&&Ra(i,n,e)||o===0&&Ra(t,i,n)||a===0&&Ra(t,e,n))}function Ra(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function Ca(i){return i>0?1:i<0?-1:0}function rg(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&gd(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function bo(i,e){return Vt(i.prev,i,i.next)<0?Vt(i,e,i.next)>=0&&Vt(i,i.prev,e)>=0:Vt(i,e,i.prev)<0||Vt(i,i.next,e)<0}function og(i,e){let t=i,n=!1,s=(i.x+e.x)/2,r=(i.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function xd(i,e){let t=bu(i.i,i.x,i.y),n=bu(e.i,e.x,e.y),s=i.next,r=e.prev;return i.next=e,e.prev=i,t.next=s,s.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function Cf(i,e,t,n){let s=bu(i,e,t);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function Eo(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function bu(i,e,t){return{i,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function ag(i,e,t,n){let s=0;for(let r=e,o=t-n;r<t;r+=n)s+=(i[o]-i[r])*(i[r+1]+i[o+1]),o=r;return s}var Eu=class{static triangulate(e,t,n=2){return Xm(e,t,n)}},Cs=class i{static area(e){let t=e.length,n=0;for(let s=t-1,r=0;r<t;s=r++)n+=e[s].x*e[r].y-e[r].x*e[s].y;return n*.5}static isClockWise(e){return i.area(e)<0}static triangulateShape(e,t){let n=[],s=[],r=[];Pf(e),If(n,e);let o=e.length;t.forEach(Pf);for(let l=0;l<t.length;l++)s.push(o),o+=t[l].length,If(n,t[l]);let a=Eu.triangulate(n,s);for(let l=0;l<a.length;l+=3)r.push(a.slice(l,l+3));return r}};function Pf(i){let e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function If(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}var Os=class i extends ft{constructor(e=new ls([new be(.5,.5),new be(-.5,.5),new be(-.5,-.5),new be(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let n=this,s=[],r=[];for(let a=0,l=e.length;a<l;a++){let c=e[a];o(c)}this.setAttribute("position",new ut(s,3)),this.setAttribute("uv",new ut(r,2)),this.computeVertexNormals();function o(a){let l=[],c=t.curveSegments!==void 0?t.curveSegments:12,u=t.steps!==void 0?t.steps:1,h=t.depth!==void 0?t.depth:1,f=t.bevelEnabled!==void 0?t.bevelEnabled:!0,d=t.bevelThickness!==void 0?t.bevelThickness:.2,g=t.bevelSize!==void 0?t.bevelSize:d-.1,x=t.bevelOffset!==void 0?t.bevelOffset:0,p=t.bevelSegments!==void 0?t.bevelSegments:3,m=t.extrudePath,y=t.UVGenerator!==void 0?t.UVGenerator:lg,_,v=!1,w,S,E,A;m&&(_=m.getSpacedPoints(u),v=!0,f=!1,w=m.computeFrenetFrames(u,!1),S=new D,E=new D,A=new D),f||(p=0,d=0,g=0,x=0);let b=a.extractPoints(c),M=b.shape,R=b.holes;if(!Cs.isClockWise(M)){M=M.reverse();for(let fe=0,le=R.length;fe<le;fe++){let ce=R[fe];Cs.isClockWise(ce)&&(R[fe]=ce.reverse())}}function U(fe){let ce=10000000000000001e-36,de=fe[0];for(let Y=1;Y<=fe.length;Y++){let G=Y%fe.length,H=fe[G],se=H.x-de.x,me=H.y-de.y,I=se*se+me*me,T=Math.max(Math.abs(H.x),Math.abs(H.y),Math.abs(de.x),Math.abs(de.y)),W=ce*T*T;if(I<=W){fe.splice(G,1),Y--;continue}de=H}}U(M),R.forEach(U);let V=R.length,X=M;for(let fe=0;fe<V;fe++){let le=R[fe];M=M.concat(le)}function $(fe,le,ce){return le||console.error("THREE.ExtrudeGeometry: vec does not exist"),fe.clone().addScaledVector(le,ce)}let K=M.length;function O(fe,le,ce){let de,Y,G,H=fe.x-le.x,se=fe.y-le.y,me=ce.x-fe.x,I=ce.y-fe.y,T=H*H+se*se,W=H*I-se*me;if(Math.abs(W)>Number.EPSILON){let te=Math.sqrt(T),ve=Math.sqrt(me*me+I*I),P=le.x-se/te,z=le.y+H/te,ne=ce.x-I/ve,k=ce.y+me/ve,ue=((ne-P)*I-(k-z)*me)/(H*I-se*me);de=P+H*ue-fe.x,Y=z+se*ue-fe.y;let xe=de*de+Y*Y;if(xe<=2)return new be(de,Y);G=Math.sqrt(xe/2)}else{let te=!1;H>Number.EPSILON?me>Number.EPSILON&&(te=!0):H<-Number.EPSILON?me<-Number.EPSILON&&(te=!0):Math.sign(se)===Math.sign(I)&&(te=!0),te?(de=-se,Y=H,G=Math.sqrt(T)):(de=H,Y=se,G=Math.sqrt(T/2))}return new be(de/G,Y/G)}let j=[];for(let fe=0,le=X.length,ce=le-1,de=fe+1;fe<le;fe++,ce++,de++)ce===le&&(ce=0),de===le&&(de=0),j[fe]=O(X[fe],X[ce],X[de]);let J=[],F,ie=j.concat();for(let fe=0,le=V;fe<le;fe++){let ce=R[fe];F=[];for(let de=0,Y=ce.length,G=Y-1,H=de+1;de<Y;de++,G++,H++)G===Y&&(G=0),H===Y&&(H=0),F[de]=O(ce[de],ce[G],ce[H]);J.push(F),ie=ie.concat(F)}let pe;if(p===0)pe=Cs.triangulateShape(X,R);else{let fe=[],le=[];for(let ce=0;ce<p;ce++){let de=ce/p,Y=d*Math.cos(de*Math.PI/2),G=g*Math.sin(de*Math.PI/2)+x;for(let H=0,se=X.length;H<se;H++){let me=$(X[H],j[H],G);Ee(me.x,me.y,-Y),de===0&&fe.push(me)}for(let H=0,se=V;H<se;H++){let me=R[H];F=J[H];let I=[];for(let T=0,W=me.length;T<W;T++){let te=$(me[T],F[T],G);Ee(te.x,te.y,-Y),de===0&&I.push(te)}de===0&&le.push(I)}}pe=Cs.triangulateShape(fe,le)}let ge=pe.length,oe=g+x;for(let fe=0;fe<K;fe++){let le=f?$(M[fe],ie[fe],oe):M[fe];v?(E.copy(w.normals[0]).multiplyScalar(le.x),S.copy(w.binormals[0]).multiplyScalar(le.y),A.copy(_[0]).add(E).add(S),Ee(A.x,A.y,A.z)):Ee(le.x,le.y,0)}for(let fe=1;fe<=u;fe++)for(let le=0;le<K;le++){let ce=f?$(M[le],ie[le],oe):M[le];v?(E.copy(w.normals[fe]).multiplyScalar(ce.x),S.copy(w.binormals[fe]).multiplyScalar(ce.y),A.copy(_[fe]).add(E).add(S),Ee(A.x,A.y,A.z)):Ee(ce.x,ce.y,h/u*fe)}for(let fe=p-1;fe>=0;fe--){let le=fe/p,ce=d*Math.cos(le*Math.PI/2),de=g*Math.sin(le*Math.PI/2)+x;for(let Y=0,G=X.length;Y<G;Y++){let H=$(X[Y],j[Y],de);Ee(H.x,H.y,h+ce)}for(let Y=0,G=R.length;Y<G;Y++){let H=R[Y];F=J[Y];for(let se=0,me=H.length;se<me;se++){let I=$(H[se],F[se],de);v?Ee(I.x,I.y+_[u-1].y,_[u-1].x+ce):Ee(I.x,I.y,h+ce)}}}Z(),ee();function Z(){let fe=s.length/3;if(f){let le=0,ce=K*le;for(let de=0;de<ge;de++){let Y=pe[de];Te(Y[2]+ce,Y[1]+ce,Y[0]+ce)}le=u+p*2,ce=K*le;for(let de=0;de<ge;de++){let Y=pe[de];Te(Y[0]+ce,Y[1]+ce,Y[2]+ce)}}else{for(let le=0;le<ge;le++){let ce=pe[le];Te(ce[2],ce[1],ce[0])}for(let le=0;le<ge;le++){let ce=pe[le];Te(ce[0]+K*u,ce[1]+K*u,ce[2]+K*u)}}n.addGroup(fe,s.length/3-fe,0)}function ee(){let fe=s.length/3,le=0;ye(X,le),le+=X.length;for(let ce=0,de=R.length;ce<de;ce++){let Y=R[ce];ye(Y,le),le+=Y.length}n.addGroup(fe,s.length/3-fe,1)}function ye(fe,le){let ce=fe.length;for(;--ce>=0;){let de=ce,Y=ce-1;Y<0&&(Y=fe.length-1);for(let G=0,H=u+p*2;G<H;G++){let se=K*G,me=K*(G+1),I=le+de+se,T=le+Y+se,W=le+Y+me,te=le+de+me;Ae(I,T,W,te)}}}function Ee(fe,le,ce){l.push(fe),l.push(le),l.push(ce)}function Te(fe,le,ce){Re(fe),Re(le),Re(ce);let de=s.length/3,Y=y.generateTopUV(n,s,de-3,de-2,de-1);N(Y[0]),N(Y[1]),N(Y[2])}function Ae(fe,le,ce,de){Re(fe),Re(le),Re(de),Re(le),Re(ce),Re(de);let Y=s.length/3,G=y.generateSideWallUV(n,s,Y-6,Y-3,Y-2,Y-1);N(G[0]),N(G[1]),N(G[3]),N(G[1]),N(G[2]),N(G[3])}function Re(fe){s.push(l[fe*3+0]),s.push(l[fe*3+1]),s.push(l[fe*3+2])}function N(fe){r.push(fe.x),r.push(fe.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return cg(t,n,e)}static fromJSON(e,t){let n=[];for(let r=0,o=e.shapes.length;r<o;r++){let a=t[e.shapes[r]];n.push(a)}let s=e.options.extrudePath;return s!==void 0&&(e.options.extrudePath=new Wa[s.type]().fromJSON(s)),new i(n,e.options)}},lg={generateTopUV:function(i,e,t,n,s){let r=e[t*3],o=e[t*3+1],a=e[n*3],l=e[n*3+1],c=e[s*3],u=e[s*3+1];return[new be(r,o),new be(a,l),new be(c,u)]},generateSideWallUV:function(i,e,t,n,s,r){let o=e[t*3],a=e[t*3+1],l=e[t*3+2],c=e[n*3],u=e[n*3+1],h=e[n*3+2],f=e[s*3],d=e[s*3+1],g=e[s*3+2],x=e[r*3],p=e[r*3+1],m=e[r*3+2];return Math.abs(a-u)<Math.abs(o-c)?[new be(o,1-l),new be(c,1-h),new be(f,1-g),new be(x,1-m)]:[new be(a,1-l),new be(u,1-h),new be(d,1-g),new be(p,1-m)]}};function cg(i,e,t){if(t.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){let r=i[n];t.shapes.push(r.uuid)}else t.shapes.push(i.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var Bs=class i extends ft{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,o=t/2,a=Math.floor(n),l=Math.floor(s),c=a+1,u=l+1,h=e/a,f=t/l,d=[],g=[],x=[],p=[];for(let m=0;m<u;m++){let y=m*f-o;for(let _=0;_<c;_++){let v=_*h-r;g.push(v,-y,0),x.push(0,0,1),p.push(_/a),p.push(1-m/l)}}for(let m=0;m<l;m++)for(let y=0;y<a;y++){let _=y+c*m,v=y+c*(m+1),w=y+1+c*(m+1),S=y+1+c*m;d.push(_,v,S),d.push(v,w,S)}this.setIndex(d),this.setAttribute("position",new ut(g,3)),this.setAttribute("normal",new ut(x,3)),this.setAttribute("uv",new ut(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}},To=class i extends ft{constructor(e=.5,t=1,n=32,s=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:o},n=Math.max(3,n),s=Math.max(1,s);let a=[],l=[],c=[],u=[],h=e,f=(t-e)/s,d=new D,g=new be;for(let x=0;x<=s;x++){for(let p=0;p<=n;p++){let m=r+p/n*o;d.x=h*Math.cos(m),d.y=h*Math.sin(m),l.push(d.x,d.y,d.z),c.push(0,0,1),g.x=(d.x/t+1)/2,g.y=(d.y/t+1)/2,u.push(g.x,g.y)}h+=f}for(let x=0;x<s;x++){let p=x*(n+1);for(let m=0;m<n;m++){let y=m+p,_=y,v=y+n+1,w=y+n+2,S=y+1;a.push(_,v,S),a.push(v,w,S)}}this.setIndex(a),this.setAttribute("position",new ut(l,3)),this.setAttribute("normal",new ut(c,3)),this.setAttribute("uv",new ut(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}};var $n=class i extends ft{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let l=Math.min(o+a,Math.PI),c=0,u=[],h=new D,f=new D,d=[],g=[],x=[],p=[];for(let m=0;m<=n;m++){let y=[],_=m/n,v=0;m===0&&o===0?v=.5/t:m===n&&l===Math.PI&&(v=-.5/t);for(let w=0;w<=t;w++){let S=w/t;h.x=-e*Math.cos(s+S*r)*Math.sin(o+_*a),h.y=e*Math.cos(o+_*a),h.z=e*Math.sin(s+S*r)*Math.sin(o+_*a),g.push(h.x,h.y,h.z),f.copy(h).normalize(),x.push(f.x,f.y,f.z),p.push(S+v,1-_),y.push(c++)}u.push(y)}for(let m=0;m<n;m++)for(let y=0;y<t;y++){let _=u[m][y+1],v=u[m][y],w=u[m+1][y],S=u[m+1][y+1];(m!==0||o>0)&&d.push(_,v,S),(m!==n-1||l<Math.PI)&&d.push(v,w,S)}this.setIndex(d),this.setAttribute("position",new ut(g,3)),this.setAttribute("normal",new ut(x,3)),this.setAttribute("uv",new ut(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var ks=class i extends ft{constructor(e=1,t=.4,n=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:s,arc:r},n=Math.floor(n),s=Math.floor(s);let o=[],a=[],l=[],c=[],u=new D,h=new D,f=new D;for(let d=0;d<=n;d++)for(let g=0;g<=s;g++){let x=g/s*r,p=d/n*Math.PI*2;h.x=(e+t*Math.cos(p))*Math.cos(x),h.y=(e+t*Math.cos(p))*Math.sin(x),h.z=t*Math.sin(p),a.push(h.x,h.y,h.z),u.x=e*Math.cos(x),u.y=e*Math.sin(x),f.subVectors(h,u).normalize(),l.push(f.x,f.y,f.z),c.push(g/s),c.push(d/n)}for(let d=1;d<=n;d++)for(let g=1;g<=s;g++){let x=(s+1)*d+g-1,p=(s+1)*(d-1)+g-1,m=(s+1)*(d-1)+g,y=(s+1)*d+g;o.push(x,p,y),o.push(p,m,y)}this.setIndex(o),this.setAttribute("position",new ut(a,3)),this.setAttribute("normal",new ut(l,3)),this.setAttribute("uv",new ut(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}};var wo=class i extends ft{constructor(e=new _o(new D(-1,-1,0),new D(-1,1,0),new D(1,1,0)),t=64,n=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:s,closed:r};let o=e.computeFrenetFrames(t,r);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;let a=new D,l=new D,c=new be,u=new D,h=[],f=[],d=[],g=[];x(),this.setIndex(g),this.setAttribute("position",new ut(h,3)),this.setAttribute("normal",new ut(f,3)),this.setAttribute("uv",new ut(d,2));function x(){for(let _=0;_<t;_++)p(_);p(r===!1?t:0),y(),m()}function p(_){u=e.getPointAt(_/t,u);let v=o.normals[_],w=o.binormals[_];for(let S=0;S<=s;S++){let E=S/s*Math.PI*2,A=Math.sin(E),b=-Math.cos(E);l.x=b*v.x+A*w.x,l.y=b*v.y+A*w.y,l.z=b*v.z+A*w.z,l.normalize(),f.push(l.x,l.y,l.z),a.x=u.x+n*l.x,a.y=u.y+n*l.y,a.z=u.z+n*l.z,h.push(a.x,a.y,a.z)}}function m(){for(let _=1;_<=t;_++)for(let v=1;v<=s;v++){let w=(s+1)*(_-1)+(v-1),S=(s+1)*_+(v-1),E=(s+1)*_+v,A=(s+1)*(_-1)+v;g.push(w,S,A),g.push(S,E,A)}}function y(){for(let _=0;_<=t;_++)for(let v=0;v<=s;v++)c.x=_/t,c.y=v/s,d.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new i(new Wa[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}};var Ao=class extends dt{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},qi=class extends Wi{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new we(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new we(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Pr,this.normalScale=new be(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new en,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Tr=class extends qi{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new be(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return pt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new we(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new we(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new we(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};var Ro=class extends Wi{constructor(e){super(),this.isMeshNormalMaterial=!0,this.type="MeshNormalMaterial",this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Pr,this.normalScale=new be(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.flatShading=!1,this.setValues(e)}copy(e){return super.copy(e),this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.flatShading=e.flatShading,this}};var cs=class extends Wi{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=nd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},qa=class extends Wi{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Pa(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function ug(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}var Hs=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let o;t:{i:if(!(e<s)){for(let a=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=s,s=t[++n],e<s)break e}o=t.length;break t}if(!(e>=r)){let a=t[1];e<a&&(n=2,r=a);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break e}o=n,n=0;break t}break n}for(;n<o;){let a=n+o>>>1;e<t[a]?o=a:n=a+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let o=0;o!==s;++o)t[o]=n[r+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Ya=class extends Hs{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:xu,endingEnd:xu}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,o=e+1,a=s[r],l=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case vu:r=e,a=2*t-n;break;case yu:r=s.length-2,a=t+s[r]-s[r+1];break;default:r=e,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case vu:o=e,l=2*n-t;break;case yu:o=1,l=n+s[1]-s[0];break;default:o=e-1,l=t}let c=(n-t)*.5,u=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-n),this._offsetPrev=r*u,this._offsetNext=o*u}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=this._offsetPrev,h=this._offsetNext,f=this._weightPrev,d=this._weightNext,g=(n-t)/(s-t),x=g*g,p=x*g,m=-f*p+2*f*x-f*g,y=(1+f)*p+(-1.5-2*f)*x+(-.5+f)*g+1,_=(-1-d)*p+(1.5+d)*x+.5*g,v=d*p-d*x;for(let w=0;w!==a;++w)r[w]=m*o[u+w]+y*o[c+w]+_*o[l+w]+v*o[h+w];return r}},Za=class extends Hs{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=(n-t)/(s-t),h=1-u;for(let f=0;f!==a;++f)r[f]=o[c+f]*h+o[l+f]*u;return r}},Ka=class extends Hs{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},Jn=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Pa(t,this.TimeBufferType),this.values=Pa(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Pa(e.times,Array),values:Pa(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Ka(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Za(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Ya(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case io:t=this.InterpolantFactoryMethodDiscrete;break;case Na:t=this.InterpolantFactoryMethodLinear;break;case Ia:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return io;case this.InterpolantFactoryMethodLinear:return Na;case this.InterpolantFactoryMethodSmooth:return Ia}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e}return this}trim(e,t){let n=this.times,s=n.length,r=0,o=s-1;for(;r!==s&&n[r]<e;)++r;for(;o!==-1&&n[o]>t;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(s!==void 0&&ug(s))for(let a=0,l=s.length;a!==l;++a){let c=s[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Ia,r=e.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=e[a],u=e[a+1];if(c!==u&&(a!==1||c!==e[0]))if(s)l=!0;else{let h=a*n,f=h-n,d=h+n;for(let g=0;g!==n;++g){let x=t[h+g];if(x!==t[f+g]||x!==t[d+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let h=a*n,f=o*n;for(let d=0;d!==n;++d)t[f+d]=t[h+d]}++o}}if(r>0){e[o]=e[r];for(let a=r*n,l=o*n,c=0;c!==n;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}};Jn.prototype.ValueTypeName="";Jn.prototype.TimeBufferType=Float32Array;Jn.prototype.ValueBufferType=Float32Array;Jn.prototype.DefaultInterpolation=Na;var us=class extends Jn{constructor(e,t,n){super(e,t,n)}};us.prototype.ValueTypeName="bool";us.prototype.ValueBufferType=Array;us.prototype.DefaultInterpolation=io;us.prototype.InterpolantFactoryMethodLinear=void 0;us.prototype.InterpolantFactoryMethodSmooth=void 0;var $a=class extends Jn{constructor(e,t,n,s){super(e,t,n,s)}};$a.prototype.ValueTypeName="color";var Ja=class extends Jn{constructor(e,t,n,s){super(e,t,n,s)}};Ja.prototype.ValueTypeName="number";var ja=class extends Hs{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-t)/(s-t),c=e*a;for(let u=c+a;c!==u;c+=4)Ut.slerpFlat(r,0,o,c-a,o,c,l);return r}},Co=class extends Jn{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new ja(this.times,this.values,this.getValueSize(),e)}};Co.prototype.ValueTypeName="quaternion";Co.prototype.InterpolantFactoryMethodSmooth=void 0;var hs=class extends Jn{constructor(e,t,n){super(e,t,n)}};hs.prototype.ValueTypeName="string";hs.prototype.ValueBufferType=Array;hs.prototype.DefaultInterpolation=io;hs.prototype.InterpolantFactoryMethodLinear=void 0;hs.prototype.InterpolantFactoryMethodSmooth=void 0;var Qa=class extends Jn{constructor(e,t,n,s){super(e,t,n,s)}};Qa.prototype.ValueTypeName="vector";var el=class{constructor(e,t,n){let s=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.abortController=new AbortController,this.itemStart=function(u){a++,r===!1&&s.onStart!==void 0&&s.onStart(u,o,a),r=!0},this.itemEnd=function(u){o++,s.onProgress!==void 0&&s.onProgress(u,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,h){return c.push(u,h),this},this.removeHandler=function(u){let h=c.indexOf(u);return h!==-1&&c.splice(h,2),this},this.getHandler=function(u){for(let h=0,f=c.length;h<f;h+=2){let d=c[h],g=c[h+1];if(d.global&&(d.lastIndex=0),d.test(u))return g}return null},this.abort=function(){return this.abortController.abort(),this.abortController=new AbortController,this}}},vd=new el,tl=class{constructor(e){this.manager=e!==void 0?e:vd,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};tl.DEFAULT_MATERIAL_NAME="__DEFAULT";var wr=class extends Gt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new we(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}};var mu=new qe,Df=new D,Lf=new D,Po=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new be(512,512),this.mapType=vn,this.map=null,this.mapPass=null,this.matrix=new qe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Sr,this._frameExtents=new be(1,1),this._viewportCount=1,this._viewports=[new mt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;Df.setFromMatrixPosition(e.matrixWorld),t.position.copy(Df),Lf.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Lf),t.updateMatrixWorld(),mu.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(mu,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(mu)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Tu=class extends Po{constructor(){super(new Qt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,n=oo*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}},Io=class extends wr{constructor(e,t,n=0,s=Math.PI/3,r=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Gt.DEFAULT_UP),this.updateMatrix(),this.target=new Gt,this.distance=n,this.angle=s,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new Tu}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},Ff=new qe,Qr=new D,gu=new D,wu=class extends Po{constructor(){super(new Qt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new be(4,2),this._viewportCount=6,this._viewports=[new mt(2,1,1,1),new mt(0,1,1,1),new mt(3,1,1,1),new mt(1,1,1,1),new mt(3,0,1,1),new mt(1,0,1,1)],this._cubeDirections=[new D(1,0,0),new D(-1,0,0),new D(0,0,1),new D(0,0,-1),new D(0,1,0),new D(0,-1,0)],this._cubeUps=[new D(0,1,0),new D(0,1,0),new D(0,1,0),new D(0,1,0),new D(0,0,1),new D(0,0,-1)]}updateMatrices(e,t=0){let n=this.camera,s=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),Qr.setFromMatrixPosition(e.matrixWorld),n.position.copy(Qr),gu.copy(n.position),gu.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(gu),n.updateMatrixWorld(),s.makeTranslation(-Qr.x,-Qr.y,-Qr.z),Ff.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Ff,n.coordinateSystem,n.reversedDepth)}},zs=class extends wr{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new wu}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},Vs=class extends uo{constructor(e=-1,t=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,o=n+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Au=class extends Po{constructor(){super(new Vs(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Do=class extends wr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Gt.DEFAULT_UP),this.updateMatrix(),this.target=new Gt,this.shadow=new Au}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}};var nl=class extends Qt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},Lo=class{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let t=performance.now();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}};var Zu="\\[\\]\\.:\\/",hg=new RegExp("["+Zu+"]","g"),Ku="[^"+Zu+"]",fg="[^"+Zu.replace("\\.","")+"]",dg=/((?:WC+[\/:])*)/.source.replace("WC",Ku),pg=/(WCOD+)?/.source.replace("WCOD",fg),mg=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Ku),gg=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Ku),xg=new RegExp("^"+dg+pg+mg+gg+"$"),vg=["material","materials","bones","map"],Ru=class{constructor(e,t,n){let s=n||Nt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},Nt=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(hg,"")}static parseTrackName(e){let t=xg.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);vg.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===t||a.uuid===t)return a;let l=n(a.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[s];if(o===void 0){let c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Nt.Composite=Ru;Nt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Nt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Nt.prototype.GetterByBindingType=[Nt.prototype._getValue_direct,Nt.prototype._getValue_array,Nt.prototype._getValue_arrayElement,Nt.prototype._getValue_toArray];Nt.prototype.SetterByBindingTypeAndVersioning=[[Nt.prototype._setValue_direct,Nt.prototype._setValue_direct_setNeedsUpdate,Nt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Nt.prototype._setValue_array,Nt.prototype._setValue_array_setNeedsUpdate,Nt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Nt.prototype._setValue_arrayElement,Nt.prototype._setValue_arrayElement_setNeedsUpdate,Nt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Nt.prototype._setValue_fromArray,Nt.prototype._setValue_fromArray_setNeedsUpdate,Nt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var PM=new Float32Array(1);var Nf=new qe,Fo=class{constructor(e,t,n=0,s=1/0){this.ray=new co(e,t),this.near=n,this.far=s,this.camera=null,this.layers=new _r,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Nf.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Nf),this}intersectObject(e,t=!0,n=[]){return Cu(e,this,n,t),n.sort(Uf),n}intersectObjects(e,t=!0,n=[]){for(let s=0,r=e.length;s<r;s++)Cu(e[s],this,n,t);return n.sort(Uf),n}};function Uf(i,e){return i.distance-e.distance}function Cu(i,e,t,n){let s=!0;if(i.layers.test(e.layers)&&i.raycast(e,t)===!1&&(s=!1),s===!0&&n===!0){let r=i.children;for(let o=0,a=r.length;o<a;o++)Cu(r[o],e,t,!0)}}function $u(i,e,t,n){let s=yg(n);switch(t){case Hu:return i*e;case El:return i*e/s.components*s.byteLength;case Tl:return i*e/s.components*s.byteLength;case Vu:return i*e*2/s.components*s.byteLength;case wl:return i*e*2/s.components*s.byteLength;case zu:return i*e*3/s.components*s.byteLength;case dn:return i*e*4/s.components*s.byteLength;case Al:return i*e*4/s.components*s.byteLength;case ko:case Ho:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case zo:case Vo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Cl:case Il:return Math.max(i,16)*Math.max(e,8)/4;case Rl:case Pl:return Math.max(i,8)*Math.max(e,8)/2;case Dl:case Ll:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Fl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Nl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ul:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Ol:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Bl:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case kl:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Hl:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case zl:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Vl:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Gl:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Wl:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Xl:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case ql:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Yl:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Zl:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Kl:case $l:case Jl:return Math.ceil(i/4)*Math.ceil(e/4)*16;case jl:case Ql:return Math.ceil(i/4)*Math.ceil(e/4)*8;case ec:case tc:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function yg(i){switch(i){case vn:case Uu:return{byteLength:1,components:1};case Rr:case Ou:case $t:return{byteLength:2,components:1};case Sl:case bl:return{byteLength:2,components:4};case ds:case Ml:case ei:return{byteLength:4,components:1};case Bu:case ku:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"180"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="180");/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Vd(){let i=null,e=!1,t=null,n=null;function s(r,o){t(r,o),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function Mg(i){let e=new WeakMap;function t(a,l){let c=a.array,u=a.usage,h=c.byteLength,f=i.createBuffer();i.bindBuffer(l,f),i.bufferData(l,c,u),a.onUploadCallback();let d;if(c instanceof Float32Array)d=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)d=i.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?d=i.HALF_FLOAT:d=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=i.SHORT;else if(c instanceof Uint32Array)d=i.UNSIGNED_INT;else if(c instanceof Int32Array)d=i.INT;else if(c instanceof Int8Array)d=i.BYTE;else if(c instanceof Uint8Array)d=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:h}}function n(a,l,c){let u=l.array,h=l.updateRanges;if(i.bindBuffer(c,a),h.length===0)i.bufferSubData(c,0,u);else{h.sort((d,g)=>d.start-g.start);let f=0;for(let d=1;d<h.length;d++){let g=h[f],x=h[d];x.start<=g.start+g.count+1?g.count=Math.max(g.count,x.start+x.count-g.start):(++f,h[f]=x)}h.length=f+1;for(let d=0,g=h.length;d<g;d++){let x=h[d];i.bufferSubData(c,x.start*u.BYTES_PER_ELEMENT,u,x.start,x.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=e.get(a);l&&(i.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var Sg=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,bg=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Eg=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Tg=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,wg=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Ag=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Rg=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Cg=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Pg=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Ig=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Dg=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Lg=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Fg=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Ng=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Ug=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Og=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Bg=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,kg=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Hg=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,zg=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Vg=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Gg=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Wg=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Xg=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,qg=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Yg=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Zg=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Kg=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,$g=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Jg=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,jg="gl_FragColor = linearToOutputTexel( gl_FragColor );",Qg=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,e1=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,t1=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,n1=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,i1=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,s1=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,r1=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,o1=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,a1=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,l1=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,c1=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,u1=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,h1=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,f1=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,d1=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,p1=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,m1=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,g1=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,x1=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,v1=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,y1=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,_1=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,M1=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,S1=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,b1=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,E1=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,T1=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,w1=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,A1=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,R1=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,C1=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,P1=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,I1=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,D1=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,L1=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,F1=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,N1=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,U1=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,O1=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,B1=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,k1=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,H1=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,z1=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,V1=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,G1=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,W1=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,X1=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,q1=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Y1=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Z1=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,K1=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,$1=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,J1=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,j1=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Q1=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,ex=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,tx=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,nx=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,ix=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,sx=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,rx=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,ox=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,ax=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,lx=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,cx=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,ux=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,hx=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,fx=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,dx=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,px=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,mx=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,gx=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,xx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,vx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,yx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,_x=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Mx=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Sx=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,bx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Ex=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Tx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,wx=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ax=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Rx=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Cx=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Px=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Ix=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Dx=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Lx=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Fx=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Nx=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Ux=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ox=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Bx=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,kx=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Hx=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,zx=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Vx=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Gx=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Wx=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Xx=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,qx=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Yx=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Zx=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Kx=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,$x=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Jx=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,jx=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Qx=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,ev=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,lt={alphahash_fragment:Sg,alphahash_pars_fragment:bg,alphamap_fragment:Eg,alphamap_pars_fragment:Tg,alphatest_fragment:wg,alphatest_pars_fragment:Ag,aomap_fragment:Rg,aomap_pars_fragment:Cg,batching_pars_vertex:Pg,batching_vertex:Ig,begin_vertex:Dg,beginnormal_vertex:Lg,bsdfs:Fg,iridescence_fragment:Ng,bumpmap_pars_fragment:Ug,clipping_planes_fragment:Og,clipping_planes_pars_fragment:Bg,clipping_planes_pars_vertex:kg,clipping_planes_vertex:Hg,color_fragment:zg,color_pars_fragment:Vg,color_pars_vertex:Gg,color_vertex:Wg,common:Xg,cube_uv_reflection_fragment:qg,defaultnormal_vertex:Yg,displacementmap_pars_vertex:Zg,displacementmap_vertex:Kg,emissivemap_fragment:$g,emissivemap_pars_fragment:Jg,colorspace_fragment:jg,colorspace_pars_fragment:Qg,envmap_fragment:e1,envmap_common_pars_fragment:t1,envmap_pars_fragment:n1,envmap_pars_vertex:i1,envmap_physical_pars_fragment:p1,envmap_vertex:s1,fog_vertex:r1,fog_pars_vertex:o1,fog_fragment:a1,fog_pars_fragment:l1,gradientmap_pars_fragment:c1,lightmap_pars_fragment:u1,lights_lambert_fragment:h1,lights_lambert_pars_fragment:f1,lights_pars_begin:d1,lights_toon_fragment:m1,lights_toon_pars_fragment:g1,lights_phong_fragment:x1,lights_phong_pars_fragment:v1,lights_physical_fragment:y1,lights_physical_pars_fragment:_1,lights_fragment_begin:M1,lights_fragment_maps:S1,lights_fragment_end:b1,logdepthbuf_fragment:E1,logdepthbuf_pars_fragment:T1,logdepthbuf_pars_vertex:w1,logdepthbuf_vertex:A1,map_fragment:R1,map_pars_fragment:C1,map_particle_fragment:P1,map_particle_pars_fragment:I1,metalnessmap_fragment:D1,metalnessmap_pars_fragment:L1,morphinstance_vertex:F1,morphcolor_vertex:N1,morphnormal_vertex:U1,morphtarget_pars_vertex:O1,morphtarget_vertex:B1,normal_fragment_begin:k1,normal_fragment_maps:H1,normal_pars_fragment:z1,normal_pars_vertex:V1,normal_vertex:G1,normalmap_pars_fragment:W1,clearcoat_normal_fragment_begin:X1,clearcoat_normal_fragment_maps:q1,clearcoat_pars_fragment:Y1,iridescence_pars_fragment:Z1,opaque_fragment:K1,packing:$1,premultiplied_alpha_fragment:J1,project_vertex:j1,dithering_fragment:Q1,dithering_pars_fragment:ex,roughnessmap_fragment:tx,roughnessmap_pars_fragment:nx,shadowmap_pars_fragment:ix,shadowmap_pars_vertex:sx,shadowmap_vertex:rx,shadowmask_pars_fragment:ox,skinbase_vertex:ax,skinning_pars_vertex:lx,skinning_vertex:cx,skinnormal_vertex:ux,specularmap_fragment:hx,specularmap_pars_fragment:fx,tonemapping_fragment:dx,tonemapping_pars_fragment:px,transmission_fragment:mx,transmission_pars_fragment:gx,uv_pars_fragment:xx,uv_pars_vertex:vx,uv_vertex:yx,worldpos_vertex:_x,background_vert:Mx,background_frag:Sx,backgroundCube_vert:bx,backgroundCube_frag:Ex,cube_vert:Tx,cube_frag:wx,depth_vert:Ax,depth_frag:Rx,distanceRGBA_vert:Cx,distanceRGBA_frag:Px,equirect_vert:Ix,equirect_frag:Dx,linedashed_vert:Lx,linedashed_frag:Fx,meshbasic_vert:Nx,meshbasic_frag:Ux,meshlambert_vert:Ox,meshlambert_frag:Bx,meshmatcap_vert:kx,meshmatcap_frag:Hx,meshnormal_vert:zx,meshnormal_frag:Vx,meshphong_vert:Gx,meshphong_frag:Wx,meshphysical_vert:Xx,meshphysical_frag:qx,meshtoon_vert:Yx,meshtoon_frag:Zx,points_vert:Kx,points_frag:$x,shadow_vert:Jx,shadow_frag:jx,sprite_vert:Qx,sprite_frag:ev},Ue={common:{diffuse:{value:new we(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ot},alphaMap:{value:null},alphaMapTransform:{value:new ot},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ot}},envmap:{envMap:{value:null},envMapRotation:{value:new ot},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ot}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ot}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ot},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ot},normalScale:{value:new be(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ot},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ot}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ot}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ot}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new we(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new we(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ot},alphaTest:{value:0},uvTransform:{value:new ot}},sprite:{diffuse:{value:new we(16777215)},opacity:{value:1},center:{value:new be(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ot},alphaMap:{value:null},alphaMapTransform:{value:new ot},alphaTest:{value:0}}},Ci={basic:{uniforms:En([Ue.common,Ue.specularmap,Ue.envmap,Ue.aomap,Ue.lightmap,Ue.fog]),vertexShader:lt.meshbasic_vert,fragmentShader:lt.meshbasic_frag},lambert:{uniforms:En([Ue.common,Ue.specularmap,Ue.envmap,Ue.aomap,Ue.lightmap,Ue.emissivemap,Ue.bumpmap,Ue.normalmap,Ue.displacementmap,Ue.fog,Ue.lights,{emissive:{value:new we(0)}}]),vertexShader:lt.meshlambert_vert,fragmentShader:lt.meshlambert_frag},phong:{uniforms:En([Ue.common,Ue.specularmap,Ue.envmap,Ue.aomap,Ue.lightmap,Ue.emissivemap,Ue.bumpmap,Ue.normalmap,Ue.displacementmap,Ue.fog,Ue.lights,{emissive:{value:new we(0)},specular:{value:new we(1118481)},shininess:{value:30}}]),vertexShader:lt.meshphong_vert,fragmentShader:lt.meshphong_frag},standard:{uniforms:En([Ue.common,Ue.envmap,Ue.aomap,Ue.lightmap,Ue.emissivemap,Ue.bumpmap,Ue.normalmap,Ue.displacementmap,Ue.roughnessmap,Ue.metalnessmap,Ue.fog,Ue.lights,{emissive:{value:new we(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:lt.meshphysical_vert,fragmentShader:lt.meshphysical_frag},toon:{uniforms:En([Ue.common,Ue.aomap,Ue.lightmap,Ue.emissivemap,Ue.bumpmap,Ue.normalmap,Ue.displacementmap,Ue.gradientmap,Ue.fog,Ue.lights,{emissive:{value:new we(0)}}]),vertexShader:lt.meshtoon_vert,fragmentShader:lt.meshtoon_frag},matcap:{uniforms:En([Ue.common,Ue.bumpmap,Ue.normalmap,Ue.displacementmap,Ue.fog,{matcap:{value:null}}]),vertexShader:lt.meshmatcap_vert,fragmentShader:lt.meshmatcap_frag},points:{uniforms:En([Ue.points,Ue.fog]),vertexShader:lt.points_vert,fragmentShader:lt.points_frag},dashed:{uniforms:En([Ue.common,Ue.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:lt.linedashed_vert,fragmentShader:lt.linedashed_frag},depth:{uniforms:En([Ue.common,Ue.displacementmap]),vertexShader:lt.depth_vert,fragmentShader:lt.depth_frag},normal:{uniforms:En([Ue.common,Ue.bumpmap,Ue.normalmap,Ue.displacementmap,{opacity:{value:1}}]),vertexShader:lt.meshnormal_vert,fragmentShader:lt.meshnormal_frag},sprite:{uniforms:En([Ue.sprite,Ue.fog]),vertexShader:lt.sprite_vert,fragmentShader:lt.sprite_frag},background:{uniforms:{uvTransform:{value:new ot},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:lt.background_vert,fragmentShader:lt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ot}},vertexShader:lt.backgroundCube_vert,fragmentShader:lt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:lt.cube_vert,fragmentShader:lt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:lt.equirect_vert,fragmentShader:lt.equirect_frag},distanceRGBA:{uniforms:En([Ue.common,Ue.displacementmap,{referencePosition:{value:new D},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:lt.distanceRGBA_vert,fragmentShader:lt.distanceRGBA_frag},shadow:{uniforms:En([Ue.lights,Ue.fog,{color:{value:new we(0)},opacity:{value:1}}]),vertexShader:lt.shadow_vert,fragmentShader:lt.shadow_frag}};Ci.physical={uniforms:En([Ci.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ot},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ot},clearcoatNormalScale:{value:new be(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ot},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ot},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ot},sheen:{value:0},sheenColor:{value:new we(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ot},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ot},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ot},transmissionSamplerSize:{value:new be},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ot},attenuationDistance:{value:0},attenuationColor:{value:new we(0)},specularColor:{value:new we(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ot},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ot},anisotropyVector:{value:new be},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ot}}]),vertexShader:lt.meshphysical_vert,fragmentShader:lt.meshphysical_frag};var nc={r:0,b:0,g:0},Ys=new en,tv=new qe;function nv(i,e,t,n,s,r,o){let a=new we(0),l=r===!0?0:1,c,u,h=null,f=0,d=null;function g(_){let v=_.isScene===!0?_.background:null;return v&&v.isTexture&&(v=(_.backgroundBlurriness>0?t:e).get(v)),v}function x(_){let v=!1,w=g(_);w===null?m(a,l):w&&w.isColor&&(m(w,1),v=!0);let S=i.xr.getEnvironmentBlendMode();S==="additive"?n.buffers.color.setClear(0,0,0,1,o):S==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||v)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function p(_,v){let w=g(v);w&&(w.isCubeTexture||w.mapping===Oo)?(u===void 0&&(u=new $e(new os(1,1,1),new dt({name:"BackgroundCubeMaterial",uniforms:qs(Ci.backgroundCube.uniforms),vertexShader:Ci.backgroundCube.vertexShader,fragmentShader:Ci.backgroundCube.fragmentShader,side:rn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(S,E,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(u)),Ys.copy(v.backgroundRotation),Ys.x*=-1,Ys.y*=-1,Ys.z*=-1,w.isCubeTexture&&w.isRenderTargetTexture===!1&&(Ys.y*=-1,Ys.z*=-1),u.material.uniforms.envMap.value=w,u.material.uniforms.flipEnvMap.value=w.isCubeTexture&&w.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=v.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(tv.makeRotationFromEuler(Ys)),u.material.toneMapped=yt.getTransfer(w.colorSpace)!==Tt,(h!==w||f!==w.version||d!==i.toneMapping)&&(u.material.needsUpdate=!0,h=w,f=w.version,d=i.toneMapping),u.layers.enableAll(),_.unshift(u,u.geometry,u.material,0,0,null)):w&&w.isTexture&&(c===void 0&&(c=new $e(new Bs(2,2),new dt({name:"BackgroundMaterial",uniforms:qs(Ci.background.uniforms),vertexShader:Ci.background.vertexShader,fragmentShader:Ci.background.fragmentShader,side:xn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=w,c.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,c.material.toneMapped=yt.getTransfer(w.colorSpace)!==Tt,w.matrixAutoUpdate===!0&&w.updateMatrix(),c.material.uniforms.uvTransform.value.copy(w.matrix),(h!==w||f!==w.version||d!==i.toneMapping)&&(c.material.needsUpdate=!0,h=w,f=w.version,d=i.toneMapping),c.layers.enableAll(),_.unshift(c,c.geometry,c.material,0,0,null))}function m(_,v){_.getRGB(nc,qu(i)),n.buffers.color.setClear(nc.r,nc.g,nc.b,v,o)}function y(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(_,v=1){a.set(_),l=v,m(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(_){l=_,m(a,l)},render:x,addToRenderList:p,dispose:y}}function iv(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=f(null),r=s,o=!1;function a(M,R,L,U,V){let X=!1,$=h(U,L,R);r!==$&&(r=$,c(r.object)),X=d(M,U,L,V),X&&g(M,U,L,V),V!==null&&e.update(V,i.ELEMENT_ARRAY_BUFFER),(X||o)&&(o=!1,v(M,R,L,U),V!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(V).buffer))}function l(){return i.createVertexArray()}function c(M){return i.bindVertexArray(M)}function u(M){return i.deleteVertexArray(M)}function h(M,R,L){let U=L.wireframe===!0,V=n[M.id];V===void 0&&(V={},n[M.id]=V);let X=V[R.id];X===void 0&&(X={},V[R.id]=X);let $=X[U];return $===void 0&&($=f(l()),X[U]=$),$}function f(M){let R=[],L=[],U=[];for(let V=0;V<t;V++)R[V]=0,L[V]=0,U[V]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:R,enabledAttributes:L,attributeDivisors:U,object:M,attributes:{},index:null}}function d(M,R,L,U){let V=r.attributes,X=R.attributes,$=0,K=L.getAttributes();for(let O in K)if(K[O].location>=0){let J=V[O],F=X[O];if(F===void 0&&(O==="instanceMatrix"&&M.instanceMatrix&&(F=M.instanceMatrix),O==="instanceColor"&&M.instanceColor&&(F=M.instanceColor)),J===void 0||J.attribute!==F||F&&J.data!==F.data)return!0;$++}return r.attributesNum!==$||r.index!==U}function g(M,R,L,U){let V={},X=R.attributes,$=0,K=L.getAttributes();for(let O in K)if(K[O].location>=0){let J=X[O];J===void 0&&(O==="instanceMatrix"&&M.instanceMatrix&&(J=M.instanceMatrix),O==="instanceColor"&&M.instanceColor&&(J=M.instanceColor));let F={};F.attribute=J,J&&J.data&&(F.data=J.data),V[O]=F,$++}r.attributes=V,r.attributesNum=$,r.index=U}function x(){let M=r.newAttributes;for(let R=0,L=M.length;R<L;R++)M[R]=0}function p(M){m(M,0)}function m(M,R){let L=r.newAttributes,U=r.enabledAttributes,V=r.attributeDivisors;L[M]=1,U[M]===0&&(i.enableVertexAttribArray(M),U[M]=1),V[M]!==R&&(i.vertexAttribDivisor(M,R),V[M]=R)}function y(){let M=r.newAttributes,R=r.enabledAttributes;for(let L=0,U=R.length;L<U;L++)R[L]!==M[L]&&(i.disableVertexAttribArray(L),R[L]=0)}function _(M,R,L,U,V,X,$){$===!0?i.vertexAttribIPointer(M,R,L,V,X):i.vertexAttribPointer(M,R,L,U,V,X)}function v(M,R,L,U){x();let V=U.attributes,X=L.getAttributes(),$=R.defaultAttributeValues;for(let K in X){let O=X[K];if(O.location>=0){let j=V[K];if(j===void 0&&(K==="instanceMatrix"&&M.instanceMatrix&&(j=M.instanceMatrix),K==="instanceColor"&&M.instanceColor&&(j=M.instanceColor)),j!==void 0){let J=j.normalized,F=j.itemSize,ie=e.get(j);if(ie===void 0)continue;let pe=ie.buffer,ge=ie.type,oe=ie.bytesPerElement,Z=ge===i.INT||ge===i.UNSIGNED_INT||j.gpuType===Ml;if(j.isInterleavedBufferAttribute){let ee=j.data,ye=ee.stride,Ee=j.offset;if(ee.isInstancedInterleavedBuffer){for(let Te=0;Te<O.locationSize;Te++)m(O.location+Te,ee.meshPerAttribute);M.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=ee.meshPerAttribute*ee.count)}else for(let Te=0;Te<O.locationSize;Te++)p(O.location+Te);i.bindBuffer(i.ARRAY_BUFFER,pe);for(let Te=0;Te<O.locationSize;Te++)_(O.location+Te,F/O.locationSize,ge,J,ye*oe,(Ee+F/O.locationSize*Te)*oe,Z)}else{if(j.isInstancedBufferAttribute){for(let ee=0;ee<O.locationSize;ee++)m(O.location+ee,j.meshPerAttribute);M.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=j.meshPerAttribute*j.count)}else for(let ee=0;ee<O.locationSize;ee++)p(O.location+ee);i.bindBuffer(i.ARRAY_BUFFER,pe);for(let ee=0;ee<O.locationSize;ee++)_(O.location+ee,F/O.locationSize,ge,J,F*oe,F/O.locationSize*ee*oe,Z)}}else if($!==void 0){let J=$[K];if(J!==void 0)switch(J.length){case 2:i.vertexAttrib2fv(O.location,J);break;case 3:i.vertexAttrib3fv(O.location,J);break;case 4:i.vertexAttrib4fv(O.location,J);break;default:i.vertexAttrib1fv(O.location,J)}}}}y()}function w(){A();for(let M in n){let R=n[M];for(let L in R){let U=R[L];for(let V in U)u(U[V].object),delete U[V];delete R[L]}delete n[M]}}function S(M){if(n[M.id]===void 0)return;let R=n[M.id];for(let L in R){let U=R[L];for(let V in U)u(U[V].object),delete U[V];delete R[L]}delete n[M.id]}function E(M){for(let R in n){let L=n[R];if(L[M.id]===void 0)continue;let U=L[M.id];for(let V in U)u(U[V].object),delete U[V];delete L[M.id]}}function A(){b(),o=!0,r!==s&&(r=s,c(r.object))}function b(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:A,resetDefaultState:b,dispose:w,releaseStatesOfGeometry:S,releaseStatesOfProgram:E,initAttributes:x,enableAttribute:p,disableUnusedAttributes:y}}function sv(i,e,t){let n;function s(c){n=c}function r(c,u){i.drawArrays(n,c,u),t.update(u,n,1)}function o(c,u,h){h!==0&&(i.drawArraysInstanced(n,c,u,h),t.update(u,n,h))}function a(c,u,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,u,0,h);let d=0;for(let g=0;g<h;g++)d+=u[g];t.update(d,n,1)}function l(c,u,h,f){if(h===0)return;let d=e.get("WEBGL_multi_draw");if(d===null)for(let g=0;g<c.length;g++)o(c[g],u[g],f[g]);else{d.multiDrawArraysInstancedWEBGL(n,c,0,u,0,f,0,h);let g=0;for(let x=0;x<h;x++)g+=u[x]*f[x];t.update(g,n,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function rv(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let E=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(E.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(E){return!(E!==dn&&n.convert(E)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(E){let A=E===$t&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(E!==vn&&n.convert(E)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&E!==ei&&!A)}function l(E){if(E==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";E="mediump"}return E==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",u=l(c);u!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);let h=t.logarithmicDepthBuffer===!0,f=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),d=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_TEXTURE_SIZE),p=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),m=i.getParameter(i.MAX_VERTEX_ATTRIBS),y=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),_=i.getParameter(i.MAX_VARYING_VECTORS),v=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),w=g>0,S=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:h,reversedDepthBuffer:f,maxTextures:d,maxVertexTextures:g,maxTextureSize:x,maxCubemapSize:p,maxAttributes:m,maxVertexUniforms:y,maxVaryings:_,maxFragmentUniforms:v,vertexTextures:w,maxSamples:S}}function ov(i){let e=this,t=null,n=0,s=!1,r=!1,o=new An,a=new ot,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,f){let d=h.length!==0||f||n!==0||s;return s=f,n=h.length,d},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,f){t=u(h,f,0)},this.setState=function(h,f,d){let g=h.clippingPlanes,x=h.clipIntersection,p=h.clipShadows,m=i.get(h);if(!s||g===null||g.length===0||r&&!p)r?u(null):c();else{let y=r?0:n,_=y*4,v=m.clippingState||null;l.value=v,v=u(g,f,_,d);for(let w=0;w!==_;++w)v[w]=t[w];m.clippingState=v,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=y}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(h,f,d,g){let x=h!==null?h.length:0,p=null;if(x!==0){if(p=l.value,g!==!0||p===null){let m=d+x*4,y=f.matrixWorldInverse;a.getNormalMatrix(y),(p===null||p.length<m)&&(p=new Float32Array(m));for(let _=0,v=d;_!==x;++_,v+=4)o.copy(h[_]).applyMatrix4(y,a),o.normal.toArray(p,v),p[v+3]=o.constant}l.value=p,l.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,p}}function av(i){let e=new WeakMap;function t(o,a){return a===vl?o.mapping=Ws:a===yl&&(o.mapping=Xs),o}function n(o){if(o&&o.isTexture){let a=o.mapping;if(a===vl||a===yl)if(e.has(o)){let l=e.get(o).texture;return t(l,o.mapping)}else{let l=o.image;if(l&&l.height>0){let c=new Ha(l.height);return c.fromEquirectangularTexture(i,o),e.set(o,c),o.addEventListener("dispose",s),t(c.texture,o.mapping)}else return null}}return o}function s(o){let a=o.target;a.removeEventListener("dispose",s);let l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}var Lr=4,yd=[.125,.215,.35,.446,.526,.582],$s=20,Ju=new Vs,_d=new we,ju=null,Qu=0,eh=0,th=!1,Ks=(1+Math.sqrt(5))/2,Dr=1/Ks,Md=[new D(-Ks,Dr,0),new D(Ks,Dr,0),new D(-Dr,0,Ks),new D(Dr,0,Ks),new D(0,Ks,-Dr),new D(0,Ks,Dr),new D(-1,1,-1),new D(1,1,-1),new D(-1,1,1),new D(1,1,1)],lv=new D,Nr=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,s=100,r={}){let{size:o=256,position:a=lv}=r;ju=this._renderer.getRenderTarget(),Qu=this._renderer.getActiveCubeFace(),eh=this._renderer.getActiveMipmapLevel(),th=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,s,l,a),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Ed(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=bd(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(ju,Qu,eh),this._renderer.xr.enabled=th,e.scissorTest=!1,ic(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Ws||e.mapping===Xs?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),ju=this._renderer.getRenderTarget(),Qu=this._renderer.getActiveCubeFace(),eh=this._renderer.getActiveMipmapLevel(),th=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:fn,minFilter:fn,generateMipmaps:!1,type:$t,format:dn,colorSpace:_i,depthBuffer:!1},s=Sd(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Sd(e,t,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=cv(r)),this._blurMaterial=uv(r,e,t)}return s}_compileMaterial(e){let t=new $e(this._lodPlanes[0],e);this._renderer.compile(t,Ju)}_sceneToCubeUV(e,t,n,s,r){let l=new Qt(90,1,t,n),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],h=this._renderer,f=h.autoClear,d=h.toneMapping;h.getClearColor(_d),h.toneMapping=jn,h.autoClear=!1,h.state.buffers.depth.getReversed()&&(h.setRenderTarget(s),h.clearDepth(),h.setRenderTarget(null));let x=new Xi({name:"PMREM.Background",side:rn,depthWrite:!1,depthTest:!1}),p=new $e(new os,x),m=!1,y=e.background;y?y.isColor&&(x.color.copy(y),e.background=null,m=!0):(x.color.copy(_d),m=!0);for(let _=0;_<6;_++){let v=_%3;v===0?(l.up.set(0,c[_],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+u[_],r.y,r.z)):v===1?(l.up.set(0,0,c[_]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+u[_],r.z)):(l.up.set(0,c[_],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+u[_]));let w=this._cubeSize;ic(s,v*w,_>2?w:0,w,w),h.setRenderTarget(s),m&&h.render(p,l),h.render(e,l)}p.geometry.dispose(),p.material.dispose(),h.toneMapping=d,h.autoClear=f,e.background=y}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===Ws||e.mapping===Xs;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Ed()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=bd());let r=s?this._cubemapMaterial:this._equirectMaterial,o=new $e(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;let l=this._cubeSize;ic(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,Ju)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let s=this._lodPlanes.length;for(let r=1;r<s;r++){let o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=Md[(s-r-1)%Md.length];this._blur(e,r-1,r,o,a)}t.autoClear=n}_blur(e,t,n,s,r){let o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,s,"latitudinal",r),this._halfBlur(o,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,o,a){let l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let u=3,h=new $e(this._lodPlanes[s],c),f=c.uniforms,d=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*d):2*Math.PI/(2*$s-1),x=r/g,p=isFinite(r)?1+Math.floor(u*x):$s;p>$s&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${$s}`);let m=[],y=0;for(let E=0;E<$s;++E){let A=E/x,b=Math.exp(-A*A/2);m.push(b),E===0?y+=b:E<p&&(y+=2*b)}for(let E=0;E<m.length;E++)m[E]=m[E]/y;f.envMap.value=e.texture,f.samples.value=p,f.weights.value=m,f.latitudinal.value=o==="latitudinal",a&&(f.poleAxis.value=a);let{_lodMax:_}=this;f.dTheta.value=g,f.mipInt.value=_-n;let v=this._sizeLods[s],w=3*v*(s>_-Lr?s-_+Lr:0),S=4*(this._cubeSize-v);ic(t,w,S,3*v,2*v),l.setRenderTarget(t),l.render(h,Ju)}};function cv(i){let e=[],t=[],n=[],s=i,r=i-Lr+1+yd.length;for(let o=0;o<r;o++){let a=Math.pow(2,s);t.push(a);let l=1/a;o>i-Lr?l=yd[o-i+Lr-1]:o===0&&(l=0),n.push(l);let c=1/(a-2),u=-c,h=1+c,f=[u,u,h,u,h,h,u,u,h,h,u,h],d=6,g=6,x=3,p=2,m=1,y=new Float32Array(x*g*d),_=new Float32Array(p*g*d),v=new Float32Array(m*g*d);for(let S=0;S<d;S++){let E=S%3*2/3-1,A=S>2?0:-1,b=[E,A,0,E+2/3,A,0,E+2/3,A+1,0,E,A,0,E+2/3,A+1,0,E,A+1,0];y.set(b,x*g*S),_.set(f,p*g*S);let M=[S,S,S,S,S,S];v.set(M,m*g*S)}let w=new ft;w.setAttribute("position",new Ze(y,x)),w.setAttribute("uv",new Ze(_,p)),w.setAttribute("faceIndex",new Ze(v,m)),e.push(w),s>Lr&&s--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function Sd(i,e,t){let n=new Lt(i,e,t);return n.texture.mapping=Oo,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function ic(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function uv(i,e,t){let n=new Float32Array($s),s=new D(0,1,0);return new dt({name:"SphericalGaussianBlur",defines:{n:$s,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:hh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:tn,depthTest:!1,depthWrite:!1})}function bd(){return new dt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:hh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:tn,depthTest:!1,depthWrite:!1})}function Ed(){return new dt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:hh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:tn,depthTest:!1,depthWrite:!1})}function hh(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function hv(i){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){let l=a.mapping,c=l===vl||l===yl,u=l===Ws||l===Xs;if(c||u){let h=e.get(a),f=h!==void 0?h.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==f)return t===null&&(t=new Nr(i)),h=c?t.fromEquirectangular(a,h):t.fromCubemap(a,h),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),h.texture;if(h!==void 0)return h.texture;{let d=a.image;return c&&d&&d.height>0||u&&d&&s(d)?(t===null&&(t=new Nr(i)),h=c?t.fromEquirectangular(a):t.fromCubemap(a),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),a.addEventListener("dispose",r),h.texture):null}}}return a}function s(a){let l=0,c=6;for(let u=0;u<c;u++)a[u]!==void 0&&l++;return l===c}function r(a){let l=a.target;l.removeEventListener("dispose",r);let c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function fv(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&vr("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function dv(i,e,t,n){let s={},r=new WeakMap;function o(h){let f=h.target;f.index!==null&&e.remove(f.index);for(let g in f.attributes)e.remove(f.attributes[g]);f.removeEventListener("dispose",o),delete s[f.id];let d=r.get(f);d&&(e.remove(d),r.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function a(h,f){return s[f.id]===!0||(f.addEventListener("dispose",o),s[f.id]=!0,t.memory.geometries++),f}function l(h){let f=h.attributes;for(let d in f)e.update(f[d],i.ARRAY_BUFFER)}function c(h){let f=[],d=h.index,g=h.attributes.position,x=0;if(d!==null){let y=d.array;x=d.version;for(let _=0,v=y.length;_<v;_+=3){let w=y[_+0],S=y[_+1],E=y[_+2];f.push(w,S,S,E,E,w)}}else if(g!==void 0){let y=g.array;x=g.version;for(let _=0,v=y.length/3-1;_<v;_+=3){let w=_+0,S=_+1,E=_+2;f.push(w,S,S,E,E,w)}}else return;let p=new(Xu(f)?Ds:Is)(f,1);p.version=x;let m=r.get(h);m&&e.remove(m),r.set(h,p)}function u(h){let f=r.get(h);if(f){let d=h.index;d!==null&&f.version<d.version&&c(h)}else c(h);return r.get(h)}return{get:a,update:l,getWireframeAttribute:u}}function pv(i,e,t){let n;function s(f){n=f}let r,o;function a(f){r=f.type,o=f.bytesPerElement}function l(f,d){i.drawElements(n,d,r,f*o),t.update(d,n,1)}function c(f,d,g){g!==0&&(i.drawElementsInstanced(n,d,r,f*o,g),t.update(d,n,g))}function u(f,d,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,r,f,0,g);let p=0;for(let m=0;m<g;m++)p+=d[m];t.update(p,n,1)}function h(f,d,g,x){if(g===0)return;let p=e.get("WEBGL_multi_draw");if(p===null)for(let m=0;m<f.length;m++)c(f[m]/o,d[m],x[m]);else{p.multiDrawElementsInstancedWEBGL(n,d,0,r,f,0,x,0,g);let m=0;for(let y=0;y<g;y++)m+=d[y]*x[y];t.update(m,n,1)}}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=h}function mv(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(r/3);break;case i.LINES:t.lines+=a*(r/2);break;case i.LINE_STRIP:t.lines+=a*(r-1);break;case i.LINE_LOOP:t.lines+=a*r;break;case i.POINTS:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function gv(i,e,t){let n=new WeakMap,s=new mt;function r(o,a,l){let c=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=u!==void 0?u.length:0,f=n.get(a);if(f===void 0||f.count!==h){let b=function(){E.dispose(),n.delete(a),a.removeEventListener("dispose",b)};f!==void 0&&f.texture.dispose();let d=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,x=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],m=a.morphAttributes.normal||[],y=a.morphAttributes.color||[],_=0;d===!0&&(_=1),g===!0&&(_=2),x===!0&&(_=3);let v=a.attributes.position.count*_,w=1;v>e.maxTextureSize&&(w=Math.ceil(v/e.maxTextureSize),v=e.maxTextureSize);let S=new Float32Array(v*w*4*h),E=new lo(S,v,w,h);E.type=ei,E.needsUpdate=!0;let A=_*4;for(let M=0;M<h;M++){let R=p[M],L=m[M],U=y[M],V=v*w*4*M;for(let X=0;X<R.count;X++){let $=X*A;d===!0&&(s.fromBufferAttribute(R,X),S[V+$+0]=s.x,S[V+$+1]=s.y,S[V+$+2]=s.z,S[V+$+3]=0),g===!0&&(s.fromBufferAttribute(L,X),S[V+$+4]=s.x,S[V+$+5]=s.y,S[V+$+6]=s.z,S[V+$+7]=0),x===!0&&(s.fromBufferAttribute(U,X),S[V+$+8]=s.x,S[V+$+9]=s.y,S[V+$+10]=s.z,S[V+$+11]=U.itemSize===4?s.w:1)}}f={count:h,texture:E,size:new be(v,w)},n.set(a,f),a.addEventListener("dispose",b)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,t);else{let d=0;for(let x=0;x<c.length;x++)d+=c[x];let g=a.morphTargetsRelative?1:1-d;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",f.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",f.size)}return{update:r}}function xv(i,e,t,n){let s=new WeakMap;function r(l){let c=n.render.frame,u=l.geometry,h=e.get(l,u);if(s.get(h)!==c&&(e.update(h),s.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){let f=l.skeleton;s.get(f)!==c&&(f.update(),s.set(f,c))}return h}function o(){s=new WeakMap}function a(l){let c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:o}}var Gd=new Rn,Td=new Fs(1,1),Wd=new lo,Xd=new Ba,qd=new ho,wd=[],Ad=[],Rd=new Float32Array(16),Cd=new Float32Array(9),Pd=new Float32Array(4);function Ur(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=wd[s];if(r===void 0&&(r=new Float32Array(s),wd[s]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(r,a)}return r}function on(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function an(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function oc(i,e){let t=Ad[e];t===void 0&&(t=new Int32Array(e),Ad[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function vv(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function yv(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(on(t,e))return;i.uniform2fv(this.addr,e),an(t,e)}}function _v(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(on(t,e))return;i.uniform3fv(this.addr,e),an(t,e)}}function Mv(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(on(t,e))return;i.uniform4fv(this.addr,e),an(t,e)}}function Sv(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(on(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),an(t,e)}else{if(on(t,n))return;Pd.set(n),i.uniformMatrix2fv(this.addr,!1,Pd),an(t,n)}}function bv(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(on(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),an(t,e)}else{if(on(t,n))return;Cd.set(n),i.uniformMatrix3fv(this.addr,!1,Cd),an(t,n)}}function Ev(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(on(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),an(t,e)}else{if(on(t,n))return;Rd.set(n),i.uniformMatrix4fv(this.addr,!1,Rd),an(t,n)}}function Tv(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function wv(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(on(t,e))return;i.uniform2iv(this.addr,e),an(t,e)}}function Av(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(on(t,e))return;i.uniform3iv(this.addr,e),an(t,e)}}function Rv(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(on(t,e))return;i.uniform4iv(this.addr,e),an(t,e)}}function Cv(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Pv(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(on(t,e))return;i.uniform2uiv(this.addr,e),an(t,e)}}function Iv(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(on(t,e))return;i.uniform3uiv(this.addr,e),an(t,e)}}function Dv(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(on(t,e))return;i.uniform4uiv(this.addr,e),an(t,e)}}function Lv(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Td.compareFunction=Gu,r=Td):r=Gd,t.setTexture2D(e||r,s)}function Fv(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||Xd,s)}function Nv(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||qd,s)}function Uv(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||Wd,s)}function Ov(i){switch(i){case 5126:return vv;case 35664:return yv;case 35665:return _v;case 35666:return Mv;case 35674:return Sv;case 35675:return bv;case 35676:return Ev;case 5124:case 35670:return Tv;case 35667:case 35671:return wv;case 35668:case 35672:return Av;case 35669:case 35673:return Rv;case 5125:return Cv;case 36294:return Pv;case 36295:return Iv;case 36296:return Dv;case 35678:case 36198:case 36298:case 36306:case 35682:return Lv;case 35679:case 36299:case 36307:return Fv;case 35680:case 36300:case 36308:case 36293:return Nv;case 36289:case 36303:case 36311:case 36292:return Uv}}function Bv(i,e){i.uniform1fv(this.addr,e)}function kv(i,e){let t=Ur(e,this.size,2);i.uniform2fv(this.addr,t)}function Hv(i,e){let t=Ur(e,this.size,3);i.uniform3fv(this.addr,t)}function zv(i,e){let t=Ur(e,this.size,4);i.uniform4fv(this.addr,t)}function Vv(i,e){let t=Ur(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Gv(i,e){let t=Ur(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Wv(i,e){let t=Ur(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Xv(i,e){i.uniform1iv(this.addr,e)}function qv(i,e){i.uniform2iv(this.addr,e)}function Yv(i,e){i.uniform3iv(this.addr,e)}function Zv(i,e){i.uniform4iv(this.addr,e)}function Kv(i,e){i.uniform1uiv(this.addr,e)}function $v(i,e){i.uniform2uiv(this.addr,e)}function Jv(i,e){i.uniform3uiv(this.addr,e)}function jv(i,e){i.uniform4uiv(this.addr,e)}function Qv(i,e,t){let n=this.cache,s=e.length,r=oc(t,s);on(n,r)||(i.uniform1iv(this.addr,r),an(n,r));for(let o=0;o!==s;++o)t.setTexture2D(e[o]||Gd,r[o])}function ey(i,e,t){let n=this.cache,s=e.length,r=oc(t,s);on(n,r)||(i.uniform1iv(this.addr,r),an(n,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||Xd,r[o])}function ty(i,e,t){let n=this.cache,s=e.length,r=oc(t,s);on(n,r)||(i.uniform1iv(this.addr,r),an(n,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||qd,r[o])}function ny(i,e,t){let n=this.cache,s=e.length,r=oc(t,s);on(n,r)||(i.uniform1iv(this.addr,r),an(n,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||Wd,r[o])}function iy(i){switch(i){case 5126:return Bv;case 35664:return kv;case 35665:return Hv;case 35666:return zv;case 35674:return Vv;case 35675:return Gv;case 35676:return Wv;case 5124:case 35670:return Xv;case 35667:case 35671:return qv;case 35668:case 35672:return Yv;case 35669:case 35673:return Zv;case 5125:return Kv;case 36294:return $v;case 36295:return Jv;case 36296:return jv;case 35678:case 36198:case 36298:case 36306:case 35682:return Qv;case 35679:case 36299:case 36307:return ey;case 35680:case 36300:case 36308:case 36293:return ty;case 36289:case 36303:case 36311:case 36292:return ny}}var ih=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Ov(t.type)}},sh=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=iy(t.type)}},rh=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(e,t[a.id],n)}}},nh=/(\w+)(\])?(\[|\.)?/g;function Id(i,e){i.seq.push(e),i.map[e.id]=e}function sy(i,e,t){let n=i.name,s=n.length;for(nh.lastIndex=0;;){let r=nh.exec(n),o=nh.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){Id(t,c===void 0?new ih(a,i,e):new sh(a,i,e));break}else{let h=t.map[a];h===void 0&&(h=new rh(a),Id(t,h)),t=h}}}var Fr=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){let r=e.getActiveUniform(t,s),o=e.getUniformLocation(t,r.name);sy(r,o,this)}}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,o=t.length;r!==o;++r){let a=t[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let o=e[s];o.id in t&&n.push(o)}return n}};function Dd(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var ry=37297,oy=0;function ay(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){let a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}var Ld=new ot;function ly(i){yt._getMatrix(Ld,yt.workingColorSpace,i);let e=`mat3( ${Ld.elements.map(t=>t.toFixed(4))} )`;switch(yt.getTransfer(i)){case so:return[e,"LinearTransferOETF"];case Tt:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Fd(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+ay(i.getShaderSource(e),a)}else return r}function cy(i,e){let t=ly(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function uy(i,e){let t;switch(e){case fl:t="Linear";break;case dl:t="Reinhard";break;case pl:t="Cineon";break;case ml:t="ACESFilmic";break;case Ar:t="AgX";break;case xl:t="Neutral";break;case gl:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var sc=new D;function hy(){yt.getLuminanceCoefficients(sc);let i=sc.x.toFixed(4),e=sc.y.toFixed(4),t=sc.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function fy(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Go).join(`
`)}function dy(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function py(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),o=r.name,a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function Go(i){return i!==""}function Nd(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Ud(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var my=/^[ \t]*#include +<([\w\d./]+)>/gm;function oh(i){return i.replace(my,xy)}var gy=new Map;function xy(i,e){let t=lt[e];if(t===void 0){let n=gy.get(e);if(n!==void 0)t=lt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return oh(t)}var vy=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Od(i){return i.replace(vy,yy)}function yy(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Bd(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function _y(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===Iu?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===il?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===Ri&&(e="SHADOWMAP_TYPE_VSM"),e}function My(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Ws:case Xs:e="ENVMAP_TYPE_CUBE";break;case Oo:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Sy(i){let e="ENVMAP_MODE_REFLECTION";return i.envMap&&i.envMapMode===Xs&&(e="ENVMAP_MODE_REFRACTION"),e}function by(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case Fu:e="ENVMAP_BLENDING_MULTIPLY";break;case Qf:e="ENVMAP_BLENDING_MIX";break;case ed:e="ENVMAP_BLENDING_ADD";break}return e}function Ey(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function Ty(i,e,t,n){let s=i.getContext(),r=t.defines,o=t.vertexShader,a=t.fragmentShader,l=_y(t),c=My(t),u=Sy(t),h=by(t),f=Ey(t),d=fy(t),g=dy(r),x=s.createProgram(),p,m,y=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Go).join(`
`),p.length>0&&(p+=`
`),m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Go).join(`
`),m.length>0&&(m+=`
`)):(p=[Bd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Go).join(`
`),m=[Bd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==jn?"#define TONE_MAPPING":"",t.toneMapping!==jn?lt.tonemapping_pars_fragment:"",t.toneMapping!==jn?uy("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",lt.colorspace_pars_fragment,cy("linearToOutputTexel",t.outputColorSpace),hy(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Go).join(`
`)),o=oh(o),o=Nd(o,t),o=Ud(o,t),a=oh(a),a=Nd(a,t),a=Ud(a,t),o=Od(o),a=Od(a),t.isRawShaderMaterial!==!0&&(y=`#version 300 es
`,p=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,m=["#define varying in",t.glslVersion===Wu?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Wu?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);let _=y+p+o,v=y+m+a,w=Dd(s,s.VERTEX_SHADER,_),S=Dd(s,s.FRAGMENT_SHADER,v);s.attachShader(x,w),s.attachShader(x,S),t.index0AttributeName!==void 0?s.bindAttribLocation(x,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(x,0,"position"),s.linkProgram(x);function E(R){if(i.debug.checkShaderErrors){let L=s.getProgramInfoLog(x)||"",U=s.getShaderInfoLog(w)||"",V=s.getShaderInfoLog(S)||"",X=L.trim(),$=U.trim(),K=V.trim(),O=!0,j=!0;if(s.getProgramParameter(x,s.LINK_STATUS)===!1)if(O=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,x,w,S);else{let J=Fd(s,w,"vertex"),F=Fd(s,S,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(x,s.VALIDATE_STATUS)+`

Material Name: `+R.name+`
Material Type: `+R.type+`

Program Info Log: `+X+`
`+J+`
`+F)}else X!==""?console.warn("THREE.WebGLProgram: Program Info Log:",X):($===""||K==="")&&(j=!1);j&&(R.diagnostics={runnable:O,programLog:X,vertexShader:{log:$,prefix:p},fragmentShader:{log:K,prefix:m}})}s.deleteShader(w),s.deleteShader(S),A=new Fr(s,x),b=py(s,x)}let A;this.getUniforms=function(){return A===void 0&&E(this),A};let b;this.getAttributes=function(){return b===void 0&&E(this),b};let M=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return M===!1&&(M=s.getProgramParameter(x,ry)),M},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(x),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=oy++,this.cacheKey=e,this.usedTimes=1,this.program=x,this.vertexShader=w,this.fragmentShader=S,this}var wy=0,ah=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new lh(e),t.set(e,n)),n}},lh=class{constructor(e){this.id=wy++,this.code=e,this.usedTimes=0}};function Ay(i,e,t,n,s,r,o){let a=new _r,l=new ah,c=new Set,u=[],h=s.logarithmicDepthBuffer,f=s.vertexTextures,d=s.precision,g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(b){return c.add(b),b===0?"uv":`uv${b}`}function p(b,M,R,L,U){let V=L.fog,X=U.geometry,$=b.isMeshStandardMaterial?L.environment:null,K=(b.isMeshStandardMaterial?t:e).get(b.envMap||$),O=K&&K.mapping===Oo?K.image.height:null,j=g[b.type];b.precision!==null&&(d=s.getMaxPrecision(b.precision),d!==b.precision&&console.warn("THREE.WebGLProgram.getParameters:",b.precision,"not supported, using",d,"instead."));let J=X.morphAttributes.position||X.morphAttributes.normal||X.morphAttributes.color,F=J!==void 0?J.length:0,ie=0;X.morphAttributes.position!==void 0&&(ie=1),X.morphAttributes.normal!==void 0&&(ie=2),X.morphAttributes.color!==void 0&&(ie=3);let pe,ge,oe,Z;if(j){let xt=Ci[j];pe=xt.vertexShader,ge=xt.fragmentShader}else pe=b.vertexShader,ge=b.fragmentShader,l.update(b),oe=l.getVertexShaderID(b),Z=l.getFragmentShaderID(b);let ee=i.getRenderTarget(),ye=i.state.buffers.depth.getReversed(),Ee=U.isInstancedMesh===!0,Te=U.isBatchedMesh===!0,Ae=!!b.map,Re=!!b.matcap,N=!!K,fe=!!b.aoMap,le=!!b.lightMap,ce=!!b.bumpMap,de=!!b.normalMap,Y=!!b.displacementMap,G=!!b.emissiveMap,H=!!b.metalnessMap,se=!!b.roughnessMap,me=b.anisotropy>0,I=b.clearcoat>0,T=b.dispersion>0,W=b.iridescence>0,te=b.sheen>0,ve=b.transmission>0,P=me&&!!b.anisotropyMap,z=I&&!!b.clearcoatMap,ne=I&&!!b.clearcoatNormalMap,k=I&&!!b.clearcoatRoughnessMap,ue=W&&!!b.iridescenceMap,xe=W&&!!b.iridescenceThicknessMap,Ie=te&&!!b.sheenColorMap,Ge=te&&!!b.sheenRoughnessMap,We=!!b.specularMap,Fe=!!b.specularColorMap,Je=!!b.specularIntensityMap,q=ve&&!!b.transmissionMap,Ce=ve&&!!b.thicknessMap,De=!!b.gradientMap,ke=!!b.alphaMap,Pe=b.alphaTest>0,Se=!!b.alphaHash,Ve=!!b.extensions,et=jn;b.toneMapped&&(ee===null||ee.isXRRenderTarget===!0)&&(et=i.toneMapping);let St={shaderID:j,shaderType:b.type,shaderName:b.name,vertexShader:pe,fragmentShader:ge,defines:b.defines,customVertexShaderID:oe,customFragmentShaderID:Z,isRawShaderMaterial:b.isRawShaderMaterial===!0,glslVersion:b.glslVersion,precision:d,batching:Te,batchingColor:Te&&U._colorsTexture!==null,instancing:Ee,instancingColor:Ee&&U.instanceColor!==null,instancingMorph:Ee&&U.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:ee===null?i.outputColorSpace:ee.isXRRenderTarget===!0?ee.texture.colorSpace:_i,alphaToCoverage:!!b.alphaToCoverage,map:Ae,matcap:Re,envMap:N,envMapMode:N&&K.mapping,envMapCubeUVHeight:O,aoMap:fe,lightMap:le,bumpMap:ce,normalMap:de,displacementMap:f&&Y,emissiveMap:G,normalMapObjectSpace:de&&b.normalMapType===id,normalMapTangentSpace:de&&b.normalMapType===Pr,metalnessMap:H,roughnessMap:se,anisotropy:me,anisotropyMap:P,clearcoat:I,clearcoatMap:z,clearcoatNormalMap:ne,clearcoatRoughnessMap:k,dispersion:T,iridescence:W,iridescenceMap:ue,iridescenceThicknessMap:xe,sheen:te,sheenColorMap:Ie,sheenRoughnessMap:Ge,specularMap:We,specularColorMap:Fe,specularIntensityMap:Je,transmission:ve,transmissionMap:q,thicknessMap:Ce,gradientMap:De,opaque:b.transparent===!1&&b.blending===Ti&&b.alphaToCoverage===!1,alphaMap:ke,alphaTest:Pe,alphaHash:Se,combine:b.combine,mapUv:Ae&&x(b.map.channel),aoMapUv:fe&&x(b.aoMap.channel),lightMapUv:le&&x(b.lightMap.channel),bumpMapUv:ce&&x(b.bumpMap.channel),normalMapUv:de&&x(b.normalMap.channel),displacementMapUv:Y&&x(b.displacementMap.channel),emissiveMapUv:G&&x(b.emissiveMap.channel),metalnessMapUv:H&&x(b.metalnessMap.channel),roughnessMapUv:se&&x(b.roughnessMap.channel),anisotropyMapUv:P&&x(b.anisotropyMap.channel),clearcoatMapUv:z&&x(b.clearcoatMap.channel),clearcoatNormalMapUv:ne&&x(b.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:k&&x(b.clearcoatRoughnessMap.channel),iridescenceMapUv:ue&&x(b.iridescenceMap.channel),iridescenceThicknessMapUv:xe&&x(b.iridescenceThicknessMap.channel),sheenColorMapUv:Ie&&x(b.sheenColorMap.channel),sheenRoughnessMapUv:Ge&&x(b.sheenRoughnessMap.channel),specularMapUv:We&&x(b.specularMap.channel),specularColorMapUv:Fe&&x(b.specularColorMap.channel),specularIntensityMapUv:Je&&x(b.specularIntensityMap.channel),transmissionMapUv:q&&x(b.transmissionMap.channel),thicknessMapUv:Ce&&x(b.thicknessMap.channel),alphaMapUv:ke&&x(b.alphaMap.channel),vertexTangents:!!X.attributes.tangent&&(de||me),vertexColors:b.vertexColors,vertexAlphas:b.vertexColors===!0&&!!X.attributes.color&&X.attributes.color.itemSize===4,pointsUvs:U.isPoints===!0&&!!X.attributes.uv&&(Ae||ke),fog:!!V,useFog:b.fog===!0,fogExp2:!!V&&V.isFogExp2,flatShading:b.flatShading===!0&&b.wireframe===!1,sizeAttenuation:b.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:ye,skinning:U.isSkinnedMesh===!0,morphTargets:X.morphAttributes.position!==void 0,morphNormals:X.morphAttributes.normal!==void 0,morphColors:X.morphAttributes.color!==void 0,morphTargetsCount:F,morphTextureStride:ie,numDirLights:M.directional.length,numPointLights:M.point.length,numSpotLights:M.spot.length,numSpotLightMaps:M.spotLightMap.length,numRectAreaLights:M.rectArea.length,numHemiLights:M.hemi.length,numDirLightShadows:M.directionalShadowMap.length,numPointLightShadows:M.pointShadowMap.length,numSpotLightShadows:M.spotShadowMap.length,numSpotLightShadowsWithMaps:M.numSpotLightShadowsWithMaps,numLightProbes:M.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:b.dithering,shadowMapEnabled:i.shadowMap.enabled&&R.length>0,shadowMapType:i.shadowMap.type,toneMapping:et,decodeVideoTexture:Ae&&b.map.isVideoTexture===!0&&yt.getTransfer(b.map.colorSpace)===Tt,decodeVideoTextureEmissive:G&&b.emissiveMap.isVideoTexture===!0&&yt.getTransfer(b.emissiveMap.colorSpace)===Tt,premultipliedAlpha:b.premultipliedAlpha,doubleSided:b.side===Wt,flipSided:b.side===rn,useDepthPacking:b.depthPacking>=0,depthPacking:b.depthPacking||0,index0AttributeName:b.index0AttributeName,extensionClipCullDistance:Ve&&b.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ve&&b.extensions.multiDraw===!0||Te)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:b.customProgramCacheKey()};return St.vertexUv1s=c.has(1),St.vertexUv2s=c.has(2),St.vertexUv3s=c.has(3),c.clear(),St}function m(b){let M=[];if(b.shaderID?M.push(b.shaderID):(M.push(b.customVertexShaderID),M.push(b.customFragmentShaderID)),b.defines!==void 0)for(let R in b.defines)M.push(R),M.push(b.defines[R]);return b.isRawShaderMaterial===!1&&(y(M,b),_(M,b),M.push(i.outputColorSpace)),M.push(b.customProgramCacheKey),M.join()}function y(b,M){b.push(M.precision),b.push(M.outputColorSpace),b.push(M.envMapMode),b.push(M.envMapCubeUVHeight),b.push(M.mapUv),b.push(M.alphaMapUv),b.push(M.lightMapUv),b.push(M.aoMapUv),b.push(M.bumpMapUv),b.push(M.normalMapUv),b.push(M.displacementMapUv),b.push(M.emissiveMapUv),b.push(M.metalnessMapUv),b.push(M.roughnessMapUv),b.push(M.anisotropyMapUv),b.push(M.clearcoatMapUv),b.push(M.clearcoatNormalMapUv),b.push(M.clearcoatRoughnessMapUv),b.push(M.iridescenceMapUv),b.push(M.iridescenceThicknessMapUv),b.push(M.sheenColorMapUv),b.push(M.sheenRoughnessMapUv),b.push(M.specularMapUv),b.push(M.specularColorMapUv),b.push(M.specularIntensityMapUv),b.push(M.transmissionMapUv),b.push(M.thicknessMapUv),b.push(M.combine),b.push(M.fogExp2),b.push(M.sizeAttenuation),b.push(M.morphTargetsCount),b.push(M.morphAttributeCount),b.push(M.numDirLights),b.push(M.numPointLights),b.push(M.numSpotLights),b.push(M.numSpotLightMaps),b.push(M.numHemiLights),b.push(M.numRectAreaLights),b.push(M.numDirLightShadows),b.push(M.numPointLightShadows),b.push(M.numSpotLightShadows),b.push(M.numSpotLightShadowsWithMaps),b.push(M.numLightProbes),b.push(M.shadowMapType),b.push(M.toneMapping),b.push(M.numClippingPlanes),b.push(M.numClipIntersection),b.push(M.depthPacking)}function _(b,M){a.disableAll(),M.supportsVertexTextures&&a.enable(0),M.instancing&&a.enable(1),M.instancingColor&&a.enable(2),M.instancingMorph&&a.enable(3),M.matcap&&a.enable(4),M.envMap&&a.enable(5),M.normalMapObjectSpace&&a.enable(6),M.normalMapTangentSpace&&a.enable(7),M.clearcoat&&a.enable(8),M.iridescence&&a.enable(9),M.alphaTest&&a.enable(10),M.vertexColors&&a.enable(11),M.vertexAlphas&&a.enable(12),M.vertexUv1s&&a.enable(13),M.vertexUv2s&&a.enable(14),M.vertexUv3s&&a.enable(15),M.vertexTangents&&a.enable(16),M.anisotropy&&a.enable(17),M.alphaHash&&a.enable(18),M.batching&&a.enable(19),M.dispersion&&a.enable(20),M.batchingColor&&a.enable(21),M.gradientMap&&a.enable(22),b.push(a.mask),a.disableAll(),M.fog&&a.enable(0),M.useFog&&a.enable(1),M.flatShading&&a.enable(2),M.logarithmicDepthBuffer&&a.enable(3),M.reversedDepthBuffer&&a.enable(4),M.skinning&&a.enable(5),M.morphTargets&&a.enable(6),M.morphNormals&&a.enable(7),M.morphColors&&a.enable(8),M.premultipliedAlpha&&a.enable(9),M.shadowMapEnabled&&a.enable(10),M.doubleSided&&a.enable(11),M.flipSided&&a.enable(12),M.useDepthPacking&&a.enable(13),M.dithering&&a.enable(14),M.transmission&&a.enable(15),M.sheen&&a.enable(16),M.opaque&&a.enable(17),M.pointsUvs&&a.enable(18),M.decodeVideoTexture&&a.enable(19),M.decodeVideoTextureEmissive&&a.enable(20),M.alphaToCoverage&&a.enable(21),b.push(a.mask)}function v(b){let M=g[b.type],R;if(M){let L=Ci[M];R=Cn.clone(L.uniforms)}else R=b.uniforms;return R}function w(b,M){let R;for(let L=0,U=u.length;L<U;L++){let V=u[L];if(V.cacheKey===M){R=V,++R.usedTimes;break}}return R===void 0&&(R=new Ty(i,M,b,r),u.push(R)),R}function S(b){if(--b.usedTimes===0){let M=u.indexOf(b);u[M]=u[u.length-1],u.pop(),b.destroy()}}function E(b){l.remove(b)}function A(){l.dispose()}return{getParameters:p,getProgramCacheKey:m,getUniforms:v,acquireProgram:w,releaseProgram:S,releaseShaderCache:E,programs:u,dispose:A}}function Ry(){let i=new WeakMap;function e(o){return i.has(o)}function t(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,l){i.get(o)[a]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function Cy(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function kd(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Hd(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function o(h,f,d,g,x,p){let m=i[e];return m===void 0?(m={id:h.id,object:h,geometry:f,material:d,groupOrder:g,renderOrder:h.renderOrder,z:x,group:p},i[e]=m):(m.id=h.id,m.object=h,m.geometry=f,m.material=d,m.groupOrder=g,m.renderOrder=h.renderOrder,m.z=x,m.group=p),e++,m}function a(h,f,d,g,x,p){let m=o(h,f,d,g,x,p);d.transmission>0?n.push(m):d.transparent===!0?s.push(m):t.push(m)}function l(h,f,d,g,x,p){let m=o(h,f,d,g,x,p);d.transmission>0?n.unshift(m):d.transparent===!0?s.unshift(m):t.unshift(m)}function c(h,f){t.length>1&&t.sort(h||Cy),n.length>1&&n.sort(f||kd),s.length>1&&s.sort(f||kd)}function u(){for(let h=e,f=i.length;h<f;h++){let d=i[h];if(d.id===null)break;d.id=null,d.object=null,d.geometry=null,d.material=null,d.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:a,unshift:l,finish:u,sort:c}}function Py(){let i=new WeakMap;function e(n,s){let r=i.get(n),o;return r===void 0?(o=new Hd,i.set(n,[o])):s>=r.length?(o=new Hd,r.push(o)):o=r[s],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function Iy(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new D,color:new we};break;case"SpotLight":t={position:new D,direction:new D,color:new we,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new D,color:new we,distance:0,decay:0};break;case"HemisphereLight":t={direction:new D,skyColor:new we,groundColor:new we};break;case"RectAreaLight":t={color:new we,position:new D,halfWidth:new D,halfHeight:new D};break}return i[e.id]=t,t}}}function Dy(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new be};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new be};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new be,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var Ly=0;function Fy(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function Ny(i){let e=new Iy,t=Dy(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new D);let s=new D,r=new qe,o=new qe;function a(c){let u=0,h=0,f=0;for(let b=0;b<9;b++)n.probe[b].set(0,0,0);let d=0,g=0,x=0,p=0,m=0,y=0,_=0,v=0,w=0,S=0,E=0;c.sort(Fy);for(let b=0,M=c.length;b<M;b++){let R=c[b],L=R.color,U=R.intensity,V=R.distance,X=R.shadow&&R.shadow.map?R.shadow.map.texture:null;if(R.isAmbientLight)u+=L.r*U,h+=L.g*U,f+=L.b*U;else if(R.isLightProbe){for(let $=0;$<9;$++)n.probe[$].addScaledVector(R.sh.coefficients[$],U);E++}else if(R.isDirectionalLight){let $=e.get(R);if($.color.copy(R.color).multiplyScalar(R.intensity),R.castShadow){let K=R.shadow,O=t.get(R);O.shadowIntensity=K.intensity,O.shadowBias=K.bias,O.shadowNormalBias=K.normalBias,O.shadowRadius=K.radius,O.shadowMapSize=K.mapSize,n.directionalShadow[d]=O,n.directionalShadowMap[d]=X,n.directionalShadowMatrix[d]=R.shadow.matrix,y++}n.directional[d]=$,d++}else if(R.isSpotLight){let $=e.get(R);$.position.setFromMatrixPosition(R.matrixWorld),$.color.copy(L).multiplyScalar(U),$.distance=V,$.coneCos=Math.cos(R.angle),$.penumbraCos=Math.cos(R.angle*(1-R.penumbra)),$.decay=R.decay,n.spot[x]=$;let K=R.shadow;if(R.map&&(n.spotLightMap[w]=R.map,w++,K.updateMatrices(R),R.castShadow&&S++),n.spotLightMatrix[x]=K.matrix,R.castShadow){let O=t.get(R);O.shadowIntensity=K.intensity,O.shadowBias=K.bias,O.shadowNormalBias=K.normalBias,O.shadowRadius=K.radius,O.shadowMapSize=K.mapSize,n.spotShadow[x]=O,n.spotShadowMap[x]=X,v++}x++}else if(R.isRectAreaLight){let $=e.get(R);$.color.copy(L).multiplyScalar(U),$.halfWidth.set(R.width*.5,0,0),$.halfHeight.set(0,R.height*.5,0),n.rectArea[p]=$,p++}else if(R.isPointLight){let $=e.get(R);if($.color.copy(R.color).multiplyScalar(R.intensity),$.distance=R.distance,$.decay=R.decay,R.castShadow){let K=R.shadow,O=t.get(R);O.shadowIntensity=K.intensity,O.shadowBias=K.bias,O.shadowNormalBias=K.normalBias,O.shadowRadius=K.radius,O.shadowMapSize=K.mapSize,O.shadowCameraNear=K.camera.near,O.shadowCameraFar=K.camera.far,n.pointShadow[g]=O,n.pointShadowMap[g]=X,n.pointShadowMatrix[g]=R.shadow.matrix,_++}n.point[g]=$,g++}else if(R.isHemisphereLight){let $=e.get(R);$.skyColor.copy(R.color).multiplyScalar(U),$.groundColor.copy(R.groundColor).multiplyScalar(U),n.hemi[m]=$,m++}}p>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Ue.LTC_FLOAT_1,n.rectAreaLTC2=Ue.LTC_FLOAT_2):(n.rectAreaLTC1=Ue.LTC_HALF_1,n.rectAreaLTC2=Ue.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=h,n.ambient[2]=f;let A=n.hash;(A.directionalLength!==d||A.pointLength!==g||A.spotLength!==x||A.rectAreaLength!==p||A.hemiLength!==m||A.numDirectionalShadows!==y||A.numPointShadows!==_||A.numSpotShadows!==v||A.numSpotMaps!==w||A.numLightProbes!==E)&&(n.directional.length=d,n.spot.length=x,n.rectArea.length=p,n.point.length=g,n.hemi.length=m,n.directionalShadow.length=y,n.directionalShadowMap.length=y,n.pointShadow.length=_,n.pointShadowMap.length=_,n.spotShadow.length=v,n.spotShadowMap.length=v,n.directionalShadowMatrix.length=y,n.pointShadowMatrix.length=_,n.spotLightMatrix.length=v+w-S,n.spotLightMap.length=w,n.numSpotLightShadowsWithMaps=S,n.numLightProbes=E,A.directionalLength=d,A.pointLength=g,A.spotLength=x,A.rectAreaLength=p,A.hemiLength=m,A.numDirectionalShadows=y,A.numPointShadows=_,A.numSpotShadows=v,A.numSpotMaps=w,A.numLightProbes=E,n.version=Ly++)}function l(c,u){let h=0,f=0,d=0,g=0,x=0,p=u.matrixWorldInverse;for(let m=0,y=c.length;m<y;m++){let _=c[m];if(_.isDirectionalLight){let v=n.directional[h];v.direction.setFromMatrixPosition(_.matrixWorld),s.setFromMatrixPosition(_.target.matrixWorld),v.direction.sub(s),v.direction.transformDirection(p),h++}else if(_.isSpotLight){let v=n.spot[d];v.position.setFromMatrixPosition(_.matrixWorld),v.position.applyMatrix4(p),v.direction.setFromMatrixPosition(_.matrixWorld),s.setFromMatrixPosition(_.target.matrixWorld),v.direction.sub(s),v.direction.transformDirection(p),d++}else if(_.isRectAreaLight){let v=n.rectArea[g];v.position.setFromMatrixPosition(_.matrixWorld),v.position.applyMatrix4(p),o.identity(),r.copy(_.matrixWorld),r.premultiply(p),o.extractRotation(r),v.halfWidth.set(_.width*.5,0,0),v.halfHeight.set(0,_.height*.5,0),v.halfWidth.applyMatrix4(o),v.halfHeight.applyMatrix4(o),g++}else if(_.isPointLight){let v=n.point[f];v.position.setFromMatrixPosition(_.matrixWorld),v.position.applyMatrix4(p),f++}else if(_.isHemisphereLight){let v=n.hemi[x];v.direction.setFromMatrixPosition(_.matrixWorld),v.direction.transformDirection(p),x++}}}return{setup:a,setupView:l,state:n}}function zd(i){let e=new Ny(i),t=[],n=[];function s(u){c.camera=u,t.length=0,n.length=0}function r(u){t.push(u)}function o(u){n.push(u)}function a(){e.setup(t)}function l(u){e.setupView(t,u)}let c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function Uy(i){let e=new WeakMap;function t(s,r=0){let o=e.get(s),a;return o===void 0?(a=new zd(i),e.set(s,[a])):r>=o.length?(a=new zd(i),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}var Oy=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,By=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function ky(i,e,t){let n=new Sr,s=new be,r=new be,o=new mt,a=new cs({depthPacking:Cr}),l=new qa,c={},u=t.maxTextureSize,h={[xn]:rn,[rn]:xn,[Wt]:Wt},f=new dt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new be},radius:{value:4}},vertexShader:Oy,fragmentShader:By}),d=f.clone();d.defines.HORIZONTAL_PASS=1;let g=new ft;g.setAttribute("position",new Ze(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new $e(g,f),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Iu;let m=this.type;this.render=function(S,E,A){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||S.length===0)return;let b=i.getRenderTarget(),M=i.getActiveCubeFace(),R=i.getActiveMipmapLevel(),L=i.state;L.setBlending(tn),L.buffers.depth.getReversed()===!0?L.buffers.color.setClear(0,0,0,0):L.buffers.color.setClear(1,1,1,1),L.buffers.depth.setTest(!0),L.setScissorTest(!1);let U=m!==Ri&&this.type===Ri,V=m===Ri&&this.type!==Ri;for(let X=0,$=S.length;X<$;X++){let K=S[X],O=K.shadow;if(O===void 0){console.warn("THREE.WebGLShadowMap:",K,"has no shadow.");continue}if(O.autoUpdate===!1&&O.needsUpdate===!1)continue;s.copy(O.mapSize);let j=O.getFrameExtents();if(s.multiply(j),r.copy(O.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/j.x),s.x=r.x*j.x,O.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/j.y),s.y=r.y*j.y,O.mapSize.y=r.y)),O.map===null||U===!0||V===!0){let F=this.type!==Ri?{minFilter:Zt,magFilter:Zt}:{};O.map!==null&&O.map.dispose(),O.map=new Lt(s.x,s.y,F),O.map.texture.name=K.name+".shadowMap",O.camera.updateProjectionMatrix()}i.setRenderTarget(O.map),i.clear();let J=O.getViewportCount();for(let F=0;F<J;F++){let ie=O.getViewport(F);o.set(r.x*ie.x,r.y*ie.y,r.x*ie.z,r.y*ie.w),L.viewport(o),O.updateMatrices(K,F),n=O.getFrustum(),v(E,A,O.camera,K,this.type)}O.isPointLightShadow!==!0&&this.type===Ri&&y(O,A),O.needsUpdate=!1}m=this.type,p.needsUpdate=!1,i.setRenderTarget(b,M,R)};function y(S,E){let A=e.update(x);f.defines.VSM_SAMPLES!==S.blurSamples&&(f.defines.VSM_SAMPLES=S.blurSamples,d.defines.VSM_SAMPLES=S.blurSamples,f.needsUpdate=!0,d.needsUpdate=!0),S.mapPass===null&&(S.mapPass=new Lt(s.x,s.y)),f.uniforms.shadow_pass.value=S.map.texture,f.uniforms.resolution.value=S.mapSize,f.uniforms.radius.value=S.radius,i.setRenderTarget(S.mapPass),i.clear(),i.renderBufferDirect(E,null,A,f,x,null),d.uniforms.shadow_pass.value=S.mapPass.texture,d.uniforms.resolution.value=S.mapSize,d.uniforms.radius.value=S.radius,i.setRenderTarget(S.map),i.clear(),i.renderBufferDirect(E,null,A,d,x,null)}function _(S,E,A,b){let M=null,R=A.isPointLight===!0?S.customDistanceMaterial:S.customDepthMaterial;if(R!==void 0)M=R;else if(M=A.isPointLight===!0?l:a,i.localClippingEnabled&&E.clipShadows===!0&&Array.isArray(E.clippingPlanes)&&E.clippingPlanes.length!==0||E.displacementMap&&E.displacementScale!==0||E.alphaMap&&E.alphaTest>0||E.map&&E.alphaTest>0||E.alphaToCoverage===!0){let L=M.uuid,U=E.uuid,V=c[L];V===void 0&&(V={},c[L]=V);let X=V[U];X===void 0&&(X=M.clone(),V[U]=X,E.addEventListener("dispose",w)),M=X}if(M.visible=E.visible,M.wireframe=E.wireframe,b===Ri?M.side=E.shadowSide!==null?E.shadowSide:E.side:M.side=E.shadowSide!==null?E.shadowSide:h[E.side],M.alphaMap=E.alphaMap,M.alphaTest=E.alphaToCoverage===!0?.5:E.alphaTest,M.map=E.map,M.clipShadows=E.clipShadows,M.clippingPlanes=E.clippingPlanes,M.clipIntersection=E.clipIntersection,M.displacementMap=E.displacementMap,M.displacementScale=E.displacementScale,M.displacementBias=E.displacementBias,M.wireframeLinewidth=E.wireframeLinewidth,M.linewidth=E.linewidth,A.isPointLight===!0&&M.isMeshDistanceMaterial===!0){let L=i.properties.get(M);L.light=A}return M}function v(S,E,A,b,M){if(S.visible===!1)return;if(S.layers.test(E.layers)&&(S.isMesh||S.isLine||S.isPoints)&&(S.castShadow||S.receiveShadow&&M===Ri)&&(!S.frustumCulled||n.intersectsObject(S))){S.modelViewMatrix.multiplyMatrices(A.matrixWorldInverse,S.matrixWorld);let U=e.update(S),V=S.material;if(Array.isArray(V)){let X=U.groups;for(let $=0,K=X.length;$<K;$++){let O=X[$],j=V[O.materialIndex];if(j&&j.visible){let J=_(S,j,b,M);S.onBeforeShadow(i,S,E,A,U,J,O),i.renderBufferDirect(A,null,U,J,S,O),S.onAfterShadow(i,S,E,A,U,J,O)}}}else if(V.visible){let X=_(S,V,b,M);S.onBeforeShadow(i,S,E,A,U,X,null),i.renderBufferDirect(A,null,U,X,S,null),S.onAfterShadow(i,S,E,A,U,X,null)}}let L=S.children;for(let U=0,V=L.length;U<V;U++)v(L[U],E,A,b,M)}function w(S){S.target.removeEventListener("dispose",w);for(let A in c){let b=c[A],M=S.target.uuid;M in b&&(b[M].dispose(),delete b[M])}}}var Hy={[rl]:ol,[al]:ul,[ll]:hl,[Ps]:cl,[ol]:rl,[ul]:al,[hl]:ll,[cl]:Ps};function zy(i,e){function t(){let q=!1,Ce=new mt,De=null,ke=new mt(0,0,0,0);return{setMask:function(Pe){De!==Pe&&!q&&(i.colorMask(Pe,Pe,Pe,Pe),De=Pe)},setLocked:function(Pe){q=Pe},setClear:function(Pe,Se,Ve,et,St){St===!0&&(Pe*=et,Se*=et,Ve*=et),Ce.set(Pe,Se,Ve,et),ke.equals(Ce)===!1&&(i.clearColor(Pe,Se,Ve,et),ke.copy(Ce))},reset:function(){q=!1,De=null,ke.set(-1,0,0,0)}}}function n(){let q=!1,Ce=!1,De=null,ke=null,Pe=null;return{setReversed:function(Se){if(Ce!==Se){let Ve=e.get("EXT_clip_control");Se?Ve.clipControlEXT(Ve.LOWER_LEFT_EXT,Ve.ZERO_TO_ONE_EXT):Ve.clipControlEXT(Ve.LOWER_LEFT_EXT,Ve.NEGATIVE_ONE_TO_ONE_EXT),Ce=Se;let et=Pe;Pe=null,this.setClear(et)}},getReversed:function(){return Ce},setTest:function(Se){Se?ee(i.DEPTH_TEST):ye(i.DEPTH_TEST)},setMask:function(Se){De!==Se&&!q&&(i.depthMask(Se),De=Se)},setFunc:function(Se){if(Ce&&(Se=Hy[Se]),ke!==Se){switch(Se){case rl:i.depthFunc(i.NEVER);break;case ol:i.depthFunc(i.ALWAYS);break;case al:i.depthFunc(i.LESS);break;case Ps:i.depthFunc(i.LEQUAL);break;case ll:i.depthFunc(i.EQUAL);break;case cl:i.depthFunc(i.GEQUAL);break;case ul:i.depthFunc(i.GREATER);break;case hl:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}ke=Se}},setLocked:function(Se){q=Se},setClear:function(Se){Pe!==Se&&(Ce&&(Se=1-Se),i.clearDepth(Se),Pe=Se)},reset:function(){q=!1,De=null,ke=null,Pe=null,Ce=!1}}}function s(){let q=!1,Ce=null,De=null,ke=null,Pe=null,Se=null,Ve=null,et=null,St=null;return{setTest:function(xt){q||(xt?ee(i.STENCIL_TEST):ye(i.STENCIL_TEST))},setMask:function(xt){Ce!==xt&&!q&&(i.stencilMask(xt),Ce=xt)},setFunc:function(xt,Vn,Tn){(De!==xt||ke!==Vn||Pe!==Tn)&&(i.stencilFunc(xt,Vn,Tn),De=xt,ke=Vn,Pe=Tn)},setOp:function(xt,Vn,Tn){(Se!==xt||Ve!==Vn||et!==Tn)&&(i.stencilOp(xt,Vn,Tn),Se=xt,Ve=Vn,et=Tn)},setLocked:function(xt){q=xt},setClear:function(xt){St!==xt&&(i.clearStencil(xt),St=xt)},reset:function(){q=!1,Ce=null,De=null,ke=null,Pe=null,Se=null,Ve=null,et=null,St=null}}}let r=new t,o=new n,a=new s,l=new WeakMap,c=new WeakMap,u={},h={},f=new WeakMap,d=[],g=null,x=!1,p=null,m=null,y=null,_=null,v=null,w=null,S=null,E=new we(0,0,0),A=0,b=!1,M=null,R=null,L=null,U=null,V=null,X=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),$=!1,K=0,O=i.getParameter(i.VERSION);O.indexOf("WebGL")!==-1?(K=parseFloat(/^WebGL (\d)/.exec(O)[1]),$=K>=1):O.indexOf("OpenGL ES")!==-1&&(K=parseFloat(/^OpenGL ES (\d)/.exec(O)[1]),$=K>=2);let j=null,J={},F=i.getParameter(i.SCISSOR_BOX),ie=i.getParameter(i.VIEWPORT),pe=new mt().fromArray(F),ge=new mt().fromArray(ie);function oe(q,Ce,De,ke){let Pe=new Uint8Array(4),Se=i.createTexture();i.bindTexture(q,Se),i.texParameteri(q,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(q,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ve=0;Ve<De;Ve++)q===i.TEXTURE_3D||q===i.TEXTURE_2D_ARRAY?i.texImage3D(Ce,0,i.RGBA,1,1,ke,0,i.RGBA,i.UNSIGNED_BYTE,Pe):i.texImage2D(Ce+Ve,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Pe);return Se}let Z={};Z[i.TEXTURE_2D]=oe(i.TEXTURE_2D,i.TEXTURE_2D,1),Z[i.TEXTURE_CUBE_MAP]=oe(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Z[i.TEXTURE_2D_ARRAY]=oe(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Z[i.TEXTURE_3D]=oe(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),ee(i.DEPTH_TEST),o.setFunc(Ps),ce(!1),de(Pu),ee(i.CULL_FACE),fe(tn);function ee(q){u[q]!==!0&&(i.enable(q),u[q]=!0)}function ye(q){u[q]!==!1&&(i.disable(q),u[q]=!1)}function Ee(q,Ce){return h[q]!==Ce?(i.bindFramebuffer(q,Ce),h[q]=Ce,q===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=Ce),q===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=Ce),!0):!1}function Te(q,Ce){let De=d,ke=!1;if(q){De=f.get(Ce),De===void 0&&(De=[],f.set(Ce,De));let Pe=q.textures;if(De.length!==Pe.length||De[0]!==i.COLOR_ATTACHMENT0){for(let Se=0,Ve=Pe.length;Se<Ve;Se++)De[Se]=i.COLOR_ATTACHMENT0+Se;De.length=Pe.length,ke=!0}}else De[0]!==i.BACK&&(De[0]=i.BACK,ke=!0);ke&&i.drawBuffers(De)}function Ae(q){return g!==q?(i.useProgram(q),g=q,!0):!1}let Re={[Zn]:i.FUNC_ADD,[kf]:i.FUNC_SUBTRACT,[Hf]:i.FUNC_REVERSE_SUBTRACT};Re[zf]=i.MIN,Re[Vf]=i.MAX;let N={[Gs]:i.ZERO,[Gf]:i.ONE,[Wf]:i.SRC_COLOR,[Da]:i.SRC_ALPHA,[Zf]:i.SRC_ALPHA_SATURATE,[Uo]:i.DST_COLOR,[No]:i.DST_ALPHA,[Xf]:i.ONE_MINUS_SRC_COLOR,[La]:i.ONE_MINUS_SRC_ALPHA,[Yf]:i.ONE_MINUS_DST_COLOR,[qf]:i.ONE_MINUS_DST_ALPHA,[Kf]:i.CONSTANT_COLOR,[$f]:i.ONE_MINUS_CONSTANT_COLOR,[Jf]:i.CONSTANT_ALPHA,[jf]:i.ONE_MINUS_CONSTANT_ALPHA};function fe(q,Ce,De,ke,Pe,Se,Ve,et,St,xt){if(q===tn){x===!0&&(ye(i.BLEND),x=!1);return}if(x===!1&&(ee(i.BLEND),x=!0),q!==sl){if(q!==p||xt!==b){if((m!==Zn||v!==Zn)&&(i.blendEquation(i.FUNC_ADD),m=Zn,v=Zn),xt)switch(q){case Ti:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case fs:i.blendFunc(i.ONE,i.ONE);break;case Du:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Lu:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",q);break}else switch(q){case Ti:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case fs:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Du:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Lu:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",q);break}y=null,_=null,w=null,S=null,E.set(0,0,0),A=0,p=q,b=xt}return}Pe=Pe||Ce,Se=Se||De,Ve=Ve||ke,(Ce!==m||Pe!==v)&&(i.blendEquationSeparate(Re[Ce],Re[Pe]),m=Ce,v=Pe),(De!==y||ke!==_||Se!==w||Ve!==S)&&(i.blendFuncSeparate(N[De],N[ke],N[Se],N[Ve]),y=De,_=ke,w=Se,S=Ve),(et.equals(E)===!1||St!==A)&&(i.blendColor(et.r,et.g,et.b,St),E.copy(et),A=St),p=q,b=!1}function le(q,Ce){q.side===Wt?ye(i.CULL_FACE):ee(i.CULL_FACE);let De=q.side===rn;Ce&&(De=!De),ce(De),q.blending===Ti&&q.transparent===!1?fe(tn):fe(q.blending,q.blendEquation,q.blendSrc,q.blendDst,q.blendEquationAlpha,q.blendSrcAlpha,q.blendDstAlpha,q.blendColor,q.blendAlpha,q.premultipliedAlpha),o.setFunc(q.depthFunc),o.setTest(q.depthTest),o.setMask(q.depthWrite),r.setMask(q.colorWrite);let ke=q.stencilWrite;a.setTest(ke),ke&&(a.setMask(q.stencilWriteMask),a.setFunc(q.stencilFunc,q.stencilRef,q.stencilFuncMask),a.setOp(q.stencilFail,q.stencilZFail,q.stencilZPass)),G(q.polygonOffset,q.polygonOffsetFactor,q.polygonOffsetUnits),q.alphaToCoverage===!0?ee(i.SAMPLE_ALPHA_TO_COVERAGE):ye(i.SAMPLE_ALPHA_TO_COVERAGE)}function ce(q){M!==q&&(q?i.frontFace(i.CW):i.frontFace(i.CCW),M=q)}function de(q){q!==Of?(ee(i.CULL_FACE),q!==R&&(q===Pu?i.cullFace(i.BACK):q===Bf?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):ye(i.CULL_FACE),R=q}function Y(q){q!==L&&($&&i.lineWidth(q),L=q)}function G(q,Ce,De){q?(ee(i.POLYGON_OFFSET_FILL),(U!==Ce||V!==De)&&(i.polygonOffset(Ce,De),U=Ce,V=De)):ye(i.POLYGON_OFFSET_FILL)}function H(q){q?ee(i.SCISSOR_TEST):ye(i.SCISSOR_TEST)}function se(q){q===void 0&&(q=i.TEXTURE0+X-1),j!==q&&(i.activeTexture(q),j=q)}function me(q,Ce,De){De===void 0&&(j===null?De=i.TEXTURE0+X-1:De=j);let ke=J[De];ke===void 0&&(ke={type:void 0,texture:void 0},J[De]=ke),(ke.type!==q||ke.texture!==Ce)&&(j!==De&&(i.activeTexture(De),j=De),i.bindTexture(q,Ce||Z[q]),ke.type=q,ke.texture=Ce)}function I(){let q=J[j];q!==void 0&&q.type!==void 0&&(i.bindTexture(q.type,null),q.type=void 0,q.texture=void 0)}function T(){try{i.compressedTexImage2D(...arguments)}catch(q){console.error("THREE.WebGLState:",q)}}function W(){try{i.compressedTexImage3D(...arguments)}catch(q){console.error("THREE.WebGLState:",q)}}function te(){try{i.texSubImage2D(...arguments)}catch(q){console.error("THREE.WebGLState:",q)}}function ve(){try{i.texSubImage3D(...arguments)}catch(q){console.error("THREE.WebGLState:",q)}}function P(){try{i.compressedTexSubImage2D(...arguments)}catch(q){console.error("THREE.WebGLState:",q)}}function z(){try{i.compressedTexSubImage3D(...arguments)}catch(q){console.error("THREE.WebGLState:",q)}}function ne(){try{i.texStorage2D(...arguments)}catch(q){console.error("THREE.WebGLState:",q)}}function k(){try{i.texStorage3D(...arguments)}catch(q){console.error("THREE.WebGLState:",q)}}function ue(){try{i.texImage2D(...arguments)}catch(q){console.error("THREE.WebGLState:",q)}}function xe(){try{i.texImage3D(...arguments)}catch(q){console.error("THREE.WebGLState:",q)}}function Ie(q){pe.equals(q)===!1&&(i.scissor(q.x,q.y,q.z,q.w),pe.copy(q))}function Ge(q){ge.equals(q)===!1&&(i.viewport(q.x,q.y,q.z,q.w),ge.copy(q))}function We(q,Ce){let De=c.get(Ce);De===void 0&&(De=new WeakMap,c.set(Ce,De));let ke=De.get(q);ke===void 0&&(ke=i.getUniformBlockIndex(Ce,q.name),De.set(q,ke))}function Fe(q,Ce){let ke=c.get(Ce).get(q);l.get(Ce)!==ke&&(i.uniformBlockBinding(Ce,ke,q.__bindingPointIndex),l.set(Ce,ke))}function Je(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),u={},j=null,J={},h={},f=new WeakMap,d=[],g=null,x=!1,p=null,m=null,y=null,_=null,v=null,w=null,S=null,E=new we(0,0,0),A=0,b=!1,M=null,R=null,L=null,U=null,V=null,pe.set(0,0,i.canvas.width,i.canvas.height),ge.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:ee,disable:ye,bindFramebuffer:Ee,drawBuffers:Te,useProgram:Ae,setBlending:fe,setMaterial:le,setFlipSided:ce,setCullFace:de,setLineWidth:Y,setPolygonOffset:G,setScissorTest:H,activeTexture:se,bindTexture:me,unbindTexture:I,compressedTexImage2D:T,compressedTexImage3D:W,texImage2D:ue,texImage3D:xe,updateUBOMapping:We,uniformBlockBinding:Fe,texStorage2D:ne,texStorage3D:k,texSubImage2D:te,texSubImage3D:ve,compressedTexSubImage2D:P,compressedTexSubImage3D:z,scissor:Ie,viewport:Ge,reset:Je}}function Vy(i,e,t,n,s,r,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new be,u=new WeakMap,h,f=new WeakMap,d=!1;try{d=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(I,T){return d?new OffscreenCanvas(I,T):ao("canvas")}function x(I,T,W){let te=1,ve=me(I);if((ve.width>W||ve.height>W)&&(te=W/Math.max(ve.width,ve.height)),te<1)if(typeof HTMLImageElement<"u"&&I instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&I instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&I instanceof ImageBitmap||typeof VideoFrame<"u"&&I instanceof VideoFrame){let P=Math.floor(te*ve.width),z=Math.floor(te*ve.height);h===void 0&&(h=g(P,z));let ne=T?g(P,z):h;return ne.width=P,ne.height=z,ne.getContext("2d").drawImage(I,0,0,P,z),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ve.width+"x"+ve.height+") to ("+P+"x"+z+")."),ne}else return"data"in I&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ve.width+"x"+ve.height+")."),I;return I}function p(I){return I.generateMipmaps}function m(I){i.generateMipmap(I)}function y(I){return I.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:I.isWebGL3DRenderTarget?i.TEXTURE_3D:I.isWebGLArrayRenderTarget||I.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function _(I,T,W,te,ve=!1){if(I!==null){if(i[I]!==void 0)return i[I];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+I+"'")}let P=T;if(T===i.RED&&(W===i.FLOAT&&(P=i.R32F),W===i.HALF_FLOAT&&(P=i.R16F),W===i.UNSIGNED_BYTE&&(P=i.R8)),T===i.RED_INTEGER&&(W===i.UNSIGNED_BYTE&&(P=i.R8UI),W===i.UNSIGNED_SHORT&&(P=i.R16UI),W===i.UNSIGNED_INT&&(P=i.R32UI),W===i.BYTE&&(P=i.R8I),W===i.SHORT&&(P=i.R16I),W===i.INT&&(P=i.R32I)),T===i.RG&&(W===i.FLOAT&&(P=i.RG32F),W===i.HALF_FLOAT&&(P=i.RG16F),W===i.UNSIGNED_BYTE&&(P=i.RG8)),T===i.RG_INTEGER&&(W===i.UNSIGNED_BYTE&&(P=i.RG8UI),W===i.UNSIGNED_SHORT&&(P=i.RG16UI),W===i.UNSIGNED_INT&&(P=i.RG32UI),W===i.BYTE&&(P=i.RG8I),W===i.SHORT&&(P=i.RG16I),W===i.INT&&(P=i.RG32I)),T===i.RGB_INTEGER&&(W===i.UNSIGNED_BYTE&&(P=i.RGB8UI),W===i.UNSIGNED_SHORT&&(P=i.RGB16UI),W===i.UNSIGNED_INT&&(P=i.RGB32UI),W===i.BYTE&&(P=i.RGB8I),W===i.SHORT&&(P=i.RGB16I),W===i.INT&&(P=i.RGB32I)),T===i.RGBA_INTEGER&&(W===i.UNSIGNED_BYTE&&(P=i.RGBA8UI),W===i.UNSIGNED_SHORT&&(P=i.RGBA16UI),W===i.UNSIGNED_INT&&(P=i.RGBA32UI),W===i.BYTE&&(P=i.RGBA8I),W===i.SHORT&&(P=i.RGBA16I),W===i.INT&&(P=i.RGBA32I)),T===i.RGB&&(W===i.UNSIGNED_INT_5_9_9_9_REV&&(P=i.RGB9_E5),W===i.UNSIGNED_INT_10F_11F_11F_REV&&(P=i.R11F_G11F_B10F)),T===i.RGBA){let z=ve?so:yt.getTransfer(te);W===i.FLOAT&&(P=i.RGBA32F),W===i.HALF_FLOAT&&(P=i.RGBA16F),W===i.UNSIGNED_BYTE&&(P=z===Tt?i.SRGB8_ALPHA8:i.RGBA8),W===i.UNSIGNED_SHORT_4_4_4_4&&(P=i.RGBA4),W===i.UNSIGNED_SHORT_5_5_5_1&&(P=i.RGB5_A1)}return(P===i.R16F||P===i.R32F||P===i.RG16F||P===i.RG32F||P===i.RGBA16F||P===i.RGBA32F)&&e.get("EXT_color_buffer_float"),P}function v(I,T){let W;return I?T===null||T===ds||T===ps?W=i.DEPTH24_STENCIL8:T===ei?W=i.DEPTH32F_STENCIL8:T===Rr&&(W=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):T===null||T===ds||T===ps?W=i.DEPTH_COMPONENT24:T===ei?W=i.DEPTH_COMPONENT32F:T===Rr&&(W=i.DEPTH_COMPONENT16),W}function w(I,T){return p(I)===!0||I.isFramebufferTexture&&I.minFilter!==Zt&&I.minFilter!==fn?Math.log2(Math.max(T.width,T.height))+1:I.mipmaps!==void 0&&I.mipmaps.length>0?I.mipmaps.length:I.isCompressedTexture&&Array.isArray(I.image)?T.mipmaps.length:1}function S(I){let T=I.target;T.removeEventListener("dispose",S),A(T),T.isVideoTexture&&u.delete(T)}function E(I){let T=I.target;T.removeEventListener("dispose",E),M(T)}function A(I){let T=n.get(I);if(T.__webglInit===void 0)return;let W=I.source,te=f.get(W);if(te){let ve=te[T.__cacheKey];ve.usedTimes--,ve.usedTimes===0&&b(I),Object.keys(te).length===0&&f.delete(W)}n.remove(I)}function b(I){let T=n.get(I);i.deleteTexture(T.__webglTexture);let W=I.source,te=f.get(W);delete te[T.__cacheKey],o.memory.textures--}function M(I){let T=n.get(I);if(I.depthTexture&&(I.depthTexture.dispose(),n.remove(I.depthTexture)),I.isWebGLCubeRenderTarget)for(let te=0;te<6;te++){if(Array.isArray(T.__webglFramebuffer[te]))for(let ve=0;ve<T.__webglFramebuffer[te].length;ve++)i.deleteFramebuffer(T.__webglFramebuffer[te][ve]);else i.deleteFramebuffer(T.__webglFramebuffer[te]);T.__webglDepthbuffer&&i.deleteRenderbuffer(T.__webglDepthbuffer[te])}else{if(Array.isArray(T.__webglFramebuffer))for(let te=0;te<T.__webglFramebuffer.length;te++)i.deleteFramebuffer(T.__webglFramebuffer[te]);else i.deleteFramebuffer(T.__webglFramebuffer);if(T.__webglDepthbuffer&&i.deleteRenderbuffer(T.__webglDepthbuffer),T.__webglMultisampledFramebuffer&&i.deleteFramebuffer(T.__webglMultisampledFramebuffer),T.__webglColorRenderbuffer)for(let te=0;te<T.__webglColorRenderbuffer.length;te++)T.__webglColorRenderbuffer[te]&&i.deleteRenderbuffer(T.__webglColorRenderbuffer[te]);T.__webglDepthRenderbuffer&&i.deleteRenderbuffer(T.__webglDepthRenderbuffer)}let W=I.textures;for(let te=0,ve=W.length;te<ve;te++){let P=n.get(W[te]);P.__webglTexture&&(i.deleteTexture(P.__webglTexture),o.memory.textures--),n.remove(W[te])}n.remove(I)}let R=0;function L(){R=0}function U(){let I=R;return I>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+I+" texture units while this GPU supports only "+s.maxTextures),R+=1,I}function V(I){let T=[];return T.push(I.wrapS),T.push(I.wrapT),T.push(I.wrapR||0),T.push(I.magFilter),T.push(I.minFilter),T.push(I.anisotropy),T.push(I.internalFormat),T.push(I.format),T.push(I.type),T.push(I.generateMipmaps),T.push(I.premultiplyAlpha),T.push(I.flipY),T.push(I.unpackAlignment),T.push(I.colorSpace),T.join()}function X(I,T){let W=n.get(I);if(I.isVideoTexture&&H(I),I.isRenderTargetTexture===!1&&I.isExternalTexture!==!0&&I.version>0&&W.__version!==I.version){let te=I.image;if(te===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(te.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Z(W,I,T);return}}else I.isExternalTexture&&(W.__webglTexture=I.sourceTexture?I.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,W.__webglTexture,i.TEXTURE0+T)}function $(I,T){let W=n.get(I);if(I.isRenderTargetTexture===!1&&I.version>0&&W.__version!==I.version){Z(W,I,T);return}t.bindTexture(i.TEXTURE_2D_ARRAY,W.__webglTexture,i.TEXTURE0+T)}function K(I,T){let W=n.get(I);if(I.isRenderTargetTexture===!1&&I.version>0&&W.__version!==I.version){Z(W,I,T);return}t.bindTexture(i.TEXTURE_3D,W.__webglTexture,i.TEXTURE0+T)}function O(I,T){let W=n.get(I);if(I.version>0&&W.__version!==I.version){ee(W,I,T);return}t.bindTexture(i.TEXTURE_CUBE_MAP,W.__webglTexture,i.TEXTURE0+T)}let j={[bn]:i.REPEAT,[On]:i.CLAMP_TO_EDGE,[Fa]:i.MIRRORED_REPEAT},J={[Zt]:i.NEAREST,[td]:i.NEAREST_MIPMAP_NEAREST,[Bo]:i.NEAREST_MIPMAP_LINEAR,[fn]:i.LINEAR,[_l]:i.LINEAR_MIPMAP_NEAREST,[Qn]:i.LINEAR_MIPMAP_LINEAR},F={[sd]:i.NEVER,[ud]:i.ALWAYS,[rd]:i.LESS,[Gu]:i.LEQUAL,[od]:i.EQUAL,[cd]:i.GEQUAL,[ad]:i.GREATER,[ld]:i.NOTEQUAL};function ie(I,T){if(T.type===ei&&e.has("OES_texture_float_linear")===!1&&(T.magFilter===fn||T.magFilter===_l||T.magFilter===Bo||T.magFilter===Qn||T.minFilter===fn||T.minFilter===_l||T.minFilter===Bo||T.minFilter===Qn)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(I,i.TEXTURE_WRAP_S,j[T.wrapS]),i.texParameteri(I,i.TEXTURE_WRAP_T,j[T.wrapT]),(I===i.TEXTURE_3D||I===i.TEXTURE_2D_ARRAY)&&i.texParameteri(I,i.TEXTURE_WRAP_R,j[T.wrapR]),i.texParameteri(I,i.TEXTURE_MAG_FILTER,J[T.magFilter]),i.texParameteri(I,i.TEXTURE_MIN_FILTER,J[T.minFilter]),T.compareFunction&&(i.texParameteri(I,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(I,i.TEXTURE_COMPARE_FUNC,F[T.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(T.magFilter===Zt||T.minFilter!==Bo&&T.minFilter!==Qn||T.type===ei&&e.has("OES_texture_float_linear")===!1)return;if(T.anisotropy>1||n.get(T).__currentAnisotropy){let W=e.get("EXT_texture_filter_anisotropic");i.texParameterf(I,W.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(T.anisotropy,s.getMaxAnisotropy())),n.get(T).__currentAnisotropy=T.anisotropy}}}function pe(I,T){let W=!1;I.__webglInit===void 0&&(I.__webglInit=!0,T.addEventListener("dispose",S));let te=T.source,ve=f.get(te);ve===void 0&&(ve={},f.set(te,ve));let P=V(T);if(P!==I.__cacheKey){ve[P]===void 0&&(ve[P]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,W=!0),ve[P].usedTimes++;let z=ve[I.__cacheKey];z!==void 0&&(ve[I.__cacheKey].usedTimes--,z.usedTimes===0&&b(T)),I.__cacheKey=P,I.__webglTexture=ve[P].texture}return W}function ge(I,T,W){return Math.floor(Math.floor(I/W)/T)}function oe(I,T,W,te){let P=I.updateRanges;if(P.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,T.width,T.height,W,te,T.data);else{P.sort((xe,Ie)=>xe.start-Ie.start);let z=0;for(let xe=1;xe<P.length;xe++){let Ie=P[z],Ge=P[xe],We=Ie.start+Ie.count,Fe=ge(Ge.start,T.width,4),Je=ge(Ie.start,T.width,4);Ge.start<=We+1&&Fe===Je&&ge(Ge.start+Ge.count-1,T.width,4)===Fe?Ie.count=Math.max(Ie.count,Ge.start+Ge.count-Ie.start):(++z,P[z]=Ge)}P.length=z+1;let ne=i.getParameter(i.UNPACK_ROW_LENGTH),k=i.getParameter(i.UNPACK_SKIP_PIXELS),ue=i.getParameter(i.UNPACK_SKIP_ROWS);i.pixelStorei(i.UNPACK_ROW_LENGTH,T.width);for(let xe=0,Ie=P.length;xe<Ie;xe++){let Ge=P[xe],We=Math.floor(Ge.start/4),Fe=Math.ceil(Ge.count/4),Je=We%T.width,q=Math.floor(We/T.width),Ce=Fe,De=1;i.pixelStorei(i.UNPACK_SKIP_PIXELS,Je),i.pixelStorei(i.UNPACK_SKIP_ROWS,q),t.texSubImage2D(i.TEXTURE_2D,0,Je,q,Ce,De,W,te,T.data)}I.clearUpdateRanges(),i.pixelStorei(i.UNPACK_ROW_LENGTH,ne),i.pixelStorei(i.UNPACK_SKIP_PIXELS,k),i.pixelStorei(i.UNPACK_SKIP_ROWS,ue)}}function Z(I,T,W){let te=i.TEXTURE_2D;(T.isDataArrayTexture||T.isCompressedArrayTexture)&&(te=i.TEXTURE_2D_ARRAY),T.isData3DTexture&&(te=i.TEXTURE_3D);let ve=pe(I,T),P=T.source;t.bindTexture(te,I.__webglTexture,i.TEXTURE0+W);let z=n.get(P);if(P.version!==z.__version||ve===!0){t.activeTexture(i.TEXTURE0+W);let ne=yt.getPrimaries(yt.workingColorSpace),k=T.colorSpace===ti?null:yt.getPrimaries(T.colorSpace),ue=T.colorSpace===ti||ne===k?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,T.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,T.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ue);let xe=x(T.image,!1,s.maxTextureSize);xe=se(T,xe);let Ie=r.convert(T.format,T.colorSpace),Ge=r.convert(T.type),We=_(T.internalFormat,Ie,Ge,T.colorSpace,T.isVideoTexture);ie(te,T);let Fe,Je=T.mipmaps,q=T.isVideoTexture!==!0,Ce=z.__version===void 0||ve===!0,De=P.dataReady,ke=w(T,xe);if(T.isDepthTexture)We=v(T.format===ms,T.type),Ce&&(q?t.texStorage2D(i.TEXTURE_2D,1,We,xe.width,xe.height):t.texImage2D(i.TEXTURE_2D,0,We,xe.width,xe.height,0,Ie,Ge,null));else if(T.isDataTexture)if(Je.length>0){q&&Ce&&t.texStorage2D(i.TEXTURE_2D,ke,We,Je[0].width,Je[0].height);for(let Pe=0,Se=Je.length;Pe<Se;Pe++)Fe=Je[Pe],q?De&&t.texSubImage2D(i.TEXTURE_2D,Pe,0,0,Fe.width,Fe.height,Ie,Ge,Fe.data):t.texImage2D(i.TEXTURE_2D,Pe,We,Fe.width,Fe.height,0,Ie,Ge,Fe.data);T.generateMipmaps=!1}else q?(Ce&&t.texStorage2D(i.TEXTURE_2D,ke,We,xe.width,xe.height),De&&oe(T,xe,Ie,Ge)):t.texImage2D(i.TEXTURE_2D,0,We,xe.width,xe.height,0,Ie,Ge,xe.data);else if(T.isCompressedTexture)if(T.isCompressedArrayTexture){q&&Ce&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ke,We,Je[0].width,Je[0].height,xe.depth);for(let Pe=0,Se=Je.length;Pe<Se;Pe++)if(Fe=Je[Pe],T.format!==dn)if(Ie!==null)if(q){if(De)if(T.layerUpdates.size>0){let Ve=$u(Fe.width,Fe.height,T.format,T.type);for(let et of T.layerUpdates){let St=Fe.data.subarray(et*Ve/Fe.data.BYTES_PER_ELEMENT,(et+1)*Ve/Fe.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,Pe,0,0,et,Fe.width,Fe.height,1,Ie,St)}T.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,Pe,0,0,0,Fe.width,Fe.height,xe.depth,Ie,Fe.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,Pe,We,Fe.width,Fe.height,xe.depth,0,Fe.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else q?De&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,Pe,0,0,0,Fe.width,Fe.height,xe.depth,Ie,Ge,Fe.data):t.texImage3D(i.TEXTURE_2D_ARRAY,Pe,We,Fe.width,Fe.height,xe.depth,0,Ie,Ge,Fe.data)}else{q&&Ce&&t.texStorage2D(i.TEXTURE_2D,ke,We,Je[0].width,Je[0].height);for(let Pe=0,Se=Je.length;Pe<Se;Pe++)Fe=Je[Pe],T.format!==dn?Ie!==null?q?De&&t.compressedTexSubImage2D(i.TEXTURE_2D,Pe,0,0,Fe.width,Fe.height,Ie,Fe.data):t.compressedTexImage2D(i.TEXTURE_2D,Pe,We,Fe.width,Fe.height,0,Fe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):q?De&&t.texSubImage2D(i.TEXTURE_2D,Pe,0,0,Fe.width,Fe.height,Ie,Ge,Fe.data):t.texImage2D(i.TEXTURE_2D,Pe,We,Fe.width,Fe.height,0,Ie,Ge,Fe.data)}else if(T.isDataArrayTexture)if(q){if(Ce&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ke,We,xe.width,xe.height,xe.depth),De)if(T.layerUpdates.size>0){let Pe=$u(xe.width,xe.height,T.format,T.type);for(let Se of T.layerUpdates){let Ve=xe.data.subarray(Se*Pe/xe.data.BYTES_PER_ELEMENT,(Se+1)*Pe/xe.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Se,xe.width,xe.height,1,Ie,Ge,Ve)}T.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,xe.width,xe.height,xe.depth,Ie,Ge,xe.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,We,xe.width,xe.height,xe.depth,0,Ie,Ge,xe.data);else if(T.isData3DTexture)q?(Ce&&t.texStorage3D(i.TEXTURE_3D,ke,We,xe.width,xe.height,xe.depth),De&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,xe.width,xe.height,xe.depth,Ie,Ge,xe.data)):t.texImage3D(i.TEXTURE_3D,0,We,xe.width,xe.height,xe.depth,0,Ie,Ge,xe.data);else if(T.isFramebufferTexture){if(Ce)if(q)t.texStorage2D(i.TEXTURE_2D,ke,We,xe.width,xe.height);else{let Pe=xe.width,Se=xe.height;for(let Ve=0;Ve<ke;Ve++)t.texImage2D(i.TEXTURE_2D,Ve,We,Pe,Se,0,Ie,Ge,null),Pe>>=1,Se>>=1}}else if(Je.length>0){if(q&&Ce){let Pe=me(Je[0]);t.texStorage2D(i.TEXTURE_2D,ke,We,Pe.width,Pe.height)}for(let Pe=0,Se=Je.length;Pe<Se;Pe++)Fe=Je[Pe],q?De&&t.texSubImage2D(i.TEXTURE_2D,Pe,0,0,Ie,Ge,Fe):t.texImage2D(i.TEXTURE_2D,Pe,We,Ie,Ge,Fe);T.generateMipmaps=!1}else if(q){if(Ce){let Pe=me(xe);t.texStorage2D(i.TEXTURE_2D,ke,We,Pe.width,Pe.height)}De&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,Ie,Ge,xe)}else t.texImage2D(i.TEXTURE_2D,0,We,Ie,Ge,xe);p(T)&&m(te),z.__version=P.version,T.onUpdate&&T.onUpdate(T)}I.__version=T.version}function ee(I,T,W){if(T.image.length!==6)return;let te=pe(I,T),ve=T.source;t.bindTexture(i.TEXTURE_CUBE_MAP,I.__webglTexture,i.TEXTURE0+W);let P=n.get(ve);if(ve.version!==P.__version||te===!0){t.activeTexture(i.TEXTURE0+W);let z=yt.getPrimaries(yt.workingColorSpace),ne=T.colorSpace===ti?null:yt.getPrimaries(T.colorSpace),k=T.colorSpace===ti||z===ne?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,T.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,T.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,k);let ue=T.isCompressedTexture||T.image[0].isCompressedTexture,xe=T.image[0]&&T.image[0].isDataTexture,Ie=[];for(let Se=0;Se<6;Se++)!ue&&!xe?Ie[Se]=x(T.image[Se],!0,s.maxCubemapSize):Ie[Se]=xe?T.image[Se].image:T.image[Se],Ie[Se]=se(T,Ie[Se]);let Ge=Ie[0],We=r.convert(T.format,T.colorSpace),Fe=r.convert(T.type),Je=_(T.internalFormat,We,Fe,T.colorSpace),q=T.isVideoTexture!==!0,Ce=P.__version===void 0||te===!0,De=ve.dataReady,ke=w(T,Ge);ie(i.TEXTURE_CUBE_MAP,T);let Pe;if(ue){q&&Ce&&t.texStorage2D(i.TEXTURE_CUBE_MAP,ke,Je,Ge.width,Ge.height);for(let Se=0;Se<6;Se++){Pe=Ie[Se].mipmaps;for(let Ve=0;Ve<Pe.length;Ve++){let et=Pe[Ve];T.format!==dn?We!==null?q?De&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Ve,0,0,et.width,et.height,We,et.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Ve,Je,et.width,et.height,0,et.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):q?De&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Ve,0,0,et.width,et.height,We,Fe,et.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Ve,Je,et.width,et.height,0,We,Fe,et.data)}}}else{if(Pe=T.mipmaps,q&&Ce){Pe.length>0&&ke++;let Se=me(Ie[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,ke,Je,Se.width,Se.height)}for(let Se=0;Se<6;Se++)if(xe){q?De&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Se,0,0,0,Ie[Se].width,Ie[Se].height,We,Fe,Ie[Se].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Se,0,Je,Ie[Se].width,Ie[Se].height,0,We,Fe,Ie[Se].data);for(let Ve=0;Ve<Pe.length;Ve++){let St=Pe[Ve].image[Se].image;q?De&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Ve+1,0,0,St.width,St.height,We,Fe,St.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Ve+1,Je,St.width,St.height,0,We,Fe,St.data)}}else{q?De&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Se,0,0,0,We,Fe,Ie[Se]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Se,0,Je,We,Fe,Ie[Se]);for(let Ve=0;Ve<Pe.length;Ve++){let et=Pe[Ve];q?De&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Ve+1,0,0,We,Fe,et.image[Se]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Ve+1,Je,We,Fe,et.image[Se])}}}p(T)&&m(i.TEXTURE_CUBE_MAP),P.__version=ve.version,T.onUpdate&&T.onUpdate(T)}I.__version=T.version}function ye(I,T,W,te,ve,P){let z=r.convert(W.format,W.colorSpace),ne=r.convert(W.type),k=_(W.internalFormat,z,ne,W.colorSpace),ue=n.get(T),xe=n.get(W);if(xe.__renderTarget=T,!ue.__hasExternalTextures){let Ie=Math.max(1,T.width>>P),Ge=Math.max(1,T.height>>P);ve===i.TEXTURE_3D||ve===i.TEXTURE_2D_ARRAY?t.texImage3D(ve,P,k,Ie,Ge,T.depth,0,z,ne,null):t.texImage2D(ve,P,k,Ie,Ge,0,z,ne,null)}t.bindFramebuffer(i.FRAMEBUFFER,I),G(T)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,te,ve,xe.__webglTexture,0,Y(T)):(ve===i.TEXTURE_2D||ve>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&ve<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,te,ve,xe.__webglTexture,P),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ee(I,T,W){if(i.bindRenderbuffer(i.RENDERBUFFER,I),T.depthBuffer){let te=T.depthTexture,ve=te&&te.isDepthTexture?te.type:null,P=v(T.stencilBuffer,ve),z=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ne=Y(T);G(T)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ne,P,T.width,T.height):W?i.renderbufferStorageMultisample(i.RENDERBUFFER,ne,P,T.width,T.height):i.renderbufferStorage(i.RENDERBUFFER,P,T.width,T.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,z,i.RENDERBUFFER,I)}else{let te=T.textures;for(let ve=0;ve<te.length;ve++){let P=te[ve],z=r.convert(P.format,P.colorSpace),ne=r.convert(P.type),k=_(P.internalFormat,z,ne,P.colorSpace),ue=Y(T);W&&G(T)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,ue,k,T.width,T.height):G(T)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ue,k,T.width,T.height):i.renderbufferStorage(i.RENDERBUFFER,k,T.width,T.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Te(I,T){if(T&&T.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,I),!(T.depthTexture&&T.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let te=n.get(T.depthTexture);te.__renderTarget=T,(!te.__webglTexture||T.depthTexture.image.width!==T.width||T.depthTexture.image.height!==T.height)&&(T.depthTexture.image.width=T.width,T.depthTexture.image.height=T.height,T.depthTexture.needsUpdate=!0),X(T.depthTexture,0);let ve=te.__webglTexture,P=Y(T);if(T.depthTexture.format===xr)G(T)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,ve,0,P):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,ve,0);else if(T.depthTexture.format===ms)G(T)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,ve,0,P):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,ve,0);else throw new Error("Unknown depthTexture format")}function Ae(I){let T=n.get(I),W=I.isWebGLCubeRenderTarget===!0;if(T.__boundDepthTexture!==I.depthTexture){let te=I.depthTexture;if(T.__depthDisposeCallback&&T.__depthDisposeCallback(),te){let ve=()=>{delete T.__boundDepthTexture,delete T.__depthDisposeCallback,te.removeEventListener("dispose",ve)};te.addEventListener("dispose",ve),T.__depthDisposeCallback=ve}T.__boundDepthTexture=te}if(I.depthTexture&&!T.__autoAllocateDepthBuffer){if(W)throw new Error("target.depthTexture not supported in Cube render targets");let te=I.texture.mipmaps;te&&te.length>0?Te(T.__webglFramebuffer[0],I):Te(T.__webglFramebuffer,I)}else if(W){T.__webglDepthbuffer=[];for(let te=0;te<6;te++)if(t.bindFramebuffer(i.FRAMEBUFFER,T.__webglFramebuffer[te]),T.__webglDepthbuffer[te]===void 0)T.__webglDepthbuffer[te]=i.createRenderbuffer(),Ee(T.__webglDepthbuffer[te],I,!1);else{let ve=I.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,P=T.__webglDepthbuffer[te];i.bindRenderbuffer(i.RENDERBUFFER,P),i.framebufferRenderbuffer(i.FRAMEBUFFER,ve,i.RENDERBUFFER,P)}}else{let te=I.texture.mipmaps;if(te&&te.length>0?t.bindFramebuffer(i.FRAMEBUFFER,T.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,T.__webglFramebuffer),T.__webglDepthbuffer===void 0)T.__webglDepthbuffer=i.createRenderbuffer(),Ee(T.__webglDepthbuffer,I,!1);else{let ve=I.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,P=T.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,P),i.framebufferRenderbuffer(i.FRAMEBUFFER,ve,i.RENDERBUFFER,P)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Re(I,T,W){let te=n.get(I);T!==void 0&&ye(te.__webglFramebuffer,I,I.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),W!==void 0&&Ae(I)}function N(I){let T=I.texture,W=n.get(I),te=n.get(T);I.addEventListener("dispose",E);let ve=I.textures,P=I.isWebGLCubeRenderTarget===!0,z=ve.length>1;if(z||(te.__webglTexture===void 0&&(te.__webglTexture=i.createTexture()),te.__version=T.version,o.memory.textures++),P){W.__webglFramebuffer=[];for(let ne=0;ne<6;ne++)if(T.mipmaps&&T.mipmaps.length>0){W.__webglFramebuffer[ne]=[];for(let k=0;k<T.mipmaps.length;k++)W.__webglFramebuffer[ne][k]=i.createFramebuffer()}else W.__webglFramebuffer[ne]=i.createFramebuffer()}else{if(T.mipmaps&&T.mipmaps.length>0){W.__webglFramebuffer=[];for(let ne=0;ne<T.mipmaps.length;ne++)W.__webglFramebuffer[ne]=i.createFramebuffer()}else W.__webglFramebuffer=i.createFramebuffer();if(z)for(let ne=0,k=ve.length;ne<k;ne++){let ue=n.get(ve[ne]);ue.__webglTexture===void 0&&(ue.__webglTexture=i.createTexture(),o.memory.textures++)}if(I.samples>0&&G(I)===!1){W.__webglMultisampledFramebuffer=i.createFramebuffer(),W.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,W.__webglMultisampledFramebuffer);for(let ne=0;ne<ve.length;ne++){let k=ve[ne];W.__webglColorRenderbuffer[ne]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,W.__webglColorRenderbuffer[ne]);let ue=r.convert(k.format,k.colorSpace),xe=r.convert(k.type),Ie=_(k.internalFormat,ue,xe,k.colorSpace,I.isXRRenderTarget===!0),Ge=Y(I);i.renderbufferStorageMultisample(i.RENDERBUFFER,Ge,Ie,I.width,I.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ne,i.RENDERBUFFER,W.__webglColorRenderbuffer[ne])}i.bindRenderbuffer(i.RENDERBUFFER,null),I.depthBuffer&&(W.__webglDepthRenderbuffer=i.createRenderbuffer(),Ee(W.__webglDepthRenderbuffer,I,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(P){t.bindTexture(i.TEXTURE_CUBE_MAP,te.__webglTexture),ie(i.TEXTURE_CUBE_MAP,T);for(let ne=0;ne<6;ne++)if(T.mipmaps&&T.mipmaps.length>0)for(let k=0;k<T.mipmaps.length;k++)ye(W.__webglFramebuffer[ne][k],I,T,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,k);else ye(W.__webglFramebuffer[ne],I,T,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0);p(T)&&m(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(z){for(let ne=0,k=ve.length;ne<k;ne++){let ue=ve[ne],xe=n.get(ue),Ie=i.TEXTURE_2D;(I.isWebGL3DRenderTarget||I.isWebGLArrayRenderTarget)&&(Ie=I.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(Ie,xe.__webglTexture),ie(Ie,ue),ye(W.__webglFramebuffer,I,ue,i.COLOR_ATTACHMENT0+ne,Ie,0),p(ue)&&m(Ie)}t.unbindTexture()}else{let ne=i.TEXTURE_2D;if((I.isWebGL3DRenderTarget||I.isWebGLArrayRenderTarget)&&(ne=I.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ne,te.__webglTexture),ie(ne,T),T.mipmaps&&T.mipmaps.length>0)for(let k=0;k<T.mipmaps.length;k++)ye(W.__webglFramebuffer[k],I,T,i.COLOR_ATTACHMENT0,ne,k);else ye(W.__webglFramebuffer,I,T,i.COLOR_ATTACHMENT0,ne,0);p(T)&&m(ne),t.unbindTexture()}I.depthBuffer&&Ae(I)}function fe(I){let T=I.textures;for(let W=0,te=T.length;W<te;W++){let ve=T[W];if(p(ve)){let P=y(I),z=n.get(ve).__webglTexture;t.bindTexture(P,z),m(P),t.unbindTexture()}}}let le=[],ce=[];function de(I){if(I.samples>0){if(G(I)===!1){let T=I.textures,W=I.width,te=I.height,ve=i.COLOR_BUFFER_BIT,P=I.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,z=n.get(I),ne=T.length>1;if(ne)for(let ue=0;ue<T.length;ue++)t.bindFramebuffer(i.FRAMEBUFFER,z.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,z.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,z.__webglMultisampledFramebuffer);let k=I.texture.mipmaps;k&&k.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,z.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,z.__webglFramebuffer);for(let ue=0;ue<T.length;ue++){if(I.resolveDepthBuffer&&(I.depthBuffer&&(ve|=i.DEPTH_BUFFER_BIT),I.stencilBuffer&&I.resolveStencilBuffer&&(ve|=i.STENCIL_BUFFER_BIT)),ne){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,z.__webglColorRenderbuffer[ue]);let xe=n.get(T[ue]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,xe,0)}i.blitFramebuffer(0,0,W,te,0,0,W,te,ve,i.NEAREST),l===!0&&(le.length=0,ce.length=0,le.push(i.COLOR_ATTACHMENT0+ue),I.depthBuffer&&I.resolveDepthBuffer===!1&&(le.push(P),ce.push(P),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,ce)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,le))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ne)for(let ue=0;ue<T.length;ue++){t.bindFramebuffer(i.FRAMEBUFFER,z.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.RENDERBUFFER,z.__webglColorRenderbuffer[ue]);let xe=n.get(T[ue]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,z.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.TEXTURE_2D,xe,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,z.__webglMultisampledFramebuffer)}else if(I.depthBuffer&&I.resolveDepthBuffer===!1&&l){let T=I.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[T])}}}function Y(I){return Math.min(s.maxSamples,I.samples)}function G(I){let T=n.get(I);return I.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&T.__useRenderToTexture!==!1}function H(I){let T=o.render.frame;u.get(I)!==T&&(u.set(I,T),I.update())}function se(I,T){let W=I.colorSpace,te=I.format,ve=I.type;return I.isCompressedTexture===!0||I.isVideoTexture===!0||W!==_i&&W!==ti&&(yt.getTransfer(W)===Tt?(te!==dn||ve!==vn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",W)),T}function me(I){return typeof HTMLImageElement<"u"&&I instanceof HTMLImageElement?(c.width=I.naturalWidth||I.width,c.height=I.naturalHeight||I.height):typeof VideoFrame<"u"&&I instanceof VideoFrame?(c.width=I.displayWidth,c.height=I.displayHeight):(c.width=I.width,c.height=I.height),c}this.allocateTextureUnit=U,this.resetTextureUnits=L,this.setTexture2D=X,this.setTexture2DArray=$,this.setTexture3D=K,this.setTextureCube=O,this.rebindTextures=Re,this.setupRenderTarget=N,this.updateRenderTargetMipmap=fe,this.updateMultisampleRenderTarget=de,this.setupDepthRenderbuffer=Ae,this.setupFrameBufferTexture=ye,this.useMultisampledRTT=G}function Gy(i,e){function t(n,s=ti){let r,o=yt.getTransfer(s);if(n===vn)return i.UNSIGNED_BYTE;if(n===Sl)return i.UNSIGNED_SHORT_4_4_4_4;if(n===bl)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Bu)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===ku)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Uu)return i.BYTE;if(n===Ou)return i.SHORT;if(n===Rr)return i.UNSIGNED_SHORT;if(n===Ml)return i.INT;if(n===ds)return i.UNSIGNED_INT;if(n===ei)return i.FLOAT;if(n===$t)return i.HALF_FLOAT;if(n===Hu)return i.ALPHA;if(n===zu)return i.RGB;if(n===dn)return i.RGBA;if(n===xr)return i.DEPTH_COMPONENT;if(n===ms)return i.DEPTH_STENCIL;if(n===El)return i.RED;if(n===Tl)return i.RED_INTEGER;if(n===Vu)return i.RG;if(n===wl)return i.RG_INTEGER;if(n===Al)return i.RGBA_INTEGER;if(n===ko||n===Ho||n===zo||n===Vo)if(o===Tt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===ko)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Ho)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===zo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Vo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===ko)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Ho)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===zo)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Vo)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Rl||n===Cl||n===Pl||n===Il)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Rl)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Cl)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Pl)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Il)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Dl||n===Ll||n===Fl)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Dl||n===Ll)return o===Tt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Fl)return o===Tt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Nl||n===Ul||n===Ol||n===Bl||n===kl||n===Hl||n===zl||n===Vl||n===Gl||n===Wl||n===Xl||n===ql||n===Yl||n===Zl)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Nl)return o===Tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Ul)return o===Tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Ol)return o===Tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Bl)return o===Tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===kl)return o===Tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Hl)return o===Tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===zl)return o===Tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Vl)return o===Tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Gl)return o===Tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Wl)return o===Tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Xl)return o===Tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===ql)return o===Tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Yl)return o===Tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Zl)return o===Tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Kl||n===$l||n===Jl)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Kl)return o===Tt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===$l)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Jl)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===jl||n===Ql||n===ec||n===tc)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===jl)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Ql)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===ec)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===tc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===ps?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var Wy=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Xy=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,ch=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new go(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new dt({vertexShader:Wy,fragmentShader:Xy,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new $e(new Bs(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},uh=class extends Gi{constructor(e,t){super();let n=this,s=null,r=1,o=null,a="local-floor",l=1,c=null,u=null,h=null,f=null,d=null,g=null,x=typeof XRWebGLBinding<"u",p=new ch,m={},y=t.getContextAttributes(),_=null,v=null,w=[],S=[],E=new be,A=null,b=new Qt;b.viewport=new mt;let M=new Qt;M.viewport=new mt;let R=[b,M],L=new nl,U=null,V=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Z){let ee=w[Z];return ee===void 0&&(ee=new Mr,w[Z]=ee),ee.getTargetRaySpace()},this.getControllerGrip=function(Z){let ee=w[Z];return ee===void 0&&(ee=new Mr,w[Z]=ee),ee.getGripSpace()},this.getHand=function(Z){let ee=w[Z];return ee===void 0&&(ee=new Mr,w[Z]=ee),ee.getHandSpace()};function X(Z){let ee=S.indexOf(Z.inputSource);if(ee===-1)return;let ye=w[ee];ye!==void 0&&(ye.update(Z.inputSource,Z.frame,c||o),ye.dispatchEvent({type:Z.type,data:Z.inputSource}))}function $(){s.removeEventListener("select",X),s.removeEventListener("selectstart",X),s.removeEventListener("selectend",X),s.removeEventListener("squeeze",X),s.removeEventListener("squeezestart",X),s.removeEventListener("squeezeend",X),s.removeEventListener("end",$),s.removeEventListener("inputsourceschange",K);for(let Z=0;Z<w.length;Z++){let ee=S[Z];ee!==null&&(S[Z]=null,w[Z].disconnect(ee))}U=null,V=null,p.reset();for(let Z in m)delete m[Z];e.setRenderTarget(_),d=null,f=null,h=null,s=null,v=null,oe.stop(),n.isPresenting=!1,e.setPixelRatio(A),e.setSize(E.width,E.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Z){r=Z,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Z){a=Z,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(Z){c=Z},this.getBaseLayer=function(){return f!==null?f:d},this.getBinding=function(){return h===null&&x&&(h=new XRWebGLBinding(s,t)),h},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(Z){if(s=Z,s!==null){if(_=e.getRenderTarget(),s.addEventListener("select",X),s.addEventListener("selectstart",X),s.addEventListener("selectend",X),s.addEventListener("squeeze",X),s.addEventListener("squeezestart",X),s.addEventListener("squeezeend",X),s.addEventListener("end",$),s.addEventListener("inputsourceschange",K),y.xrCompatible!==!0&&await t.makeXRCompatible(),A=e.getPixelRatio(),e.getSize(E),x&&"createProjectionLayer"in XRWebGLBinding.prototype){let ye=null,Ee=null,Te=null;y.depth&&(Te=y.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ye=y.stencil?ms:xr,Ee=y.stencil?ps:ds);let Ae={colorFormat:t.RGBA8,depthFormat:Te,scaleFactor:r};h=this.getBinding(),f=h.createProjectionLayer(Ae),s.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),v=new Lt(f.textureWidth,f.textureHeight,{format:dn,type:vn,depthTexture:new Fs(f.textureWidth,f.textureHeight,Ee,void 0,void 0,void 0,void 0,void 0,void 0,ye),stencilBuffer:y.stencil,colorSpace:e.outputColorSpace,samples:y.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}else{let ye={antialias:y.antialias,alpha:!0,depth:y.depth,stencil:y.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(s,t,ye),s.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),v=new Lt(d.framebufferWidth,d.framebufferHeight,{format:dn,type:vn,colorSpace:e.outputColorSpace,stencilBuffer:y.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),oe.setContext(s),oe.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return p.getDepthTexture()};function K(Z){for(let ee=0;ee<Z.removed.length;ee++){let ye=Z.removed[ee],Ee=S.indexOf(ye);Ee>=0&&(S[Ee]=null,w[Ee].disconnect(ye))}for(let ee=0;ee<Z.added.length;ee++){let ye=Z.added[ee],Ee=S.indexOf(ye);if(Ee===-1){for(let Ae=0;Ae<w.length;Ae++)if(Ae>=S.length){S.push(ye),Ee=Ae;break}else if(S[Ae]===null){S[Ae]=ye,Ee=Ae;break}if(Ee===-1)break}let Te=w[Ee];Te&&Te.connect(ye)}}let O=new D,j=new D;function J(Z,ee,ye){O.setFromMatrixPosition(ee.matrixWorld),j.setFromMatrixPosition(ye.matrixWorld);let Ee=O.distanceTo(j),Te=ee.projectionMatrix.elements,Ae=ye.projectionMatrix.elements,Re=Te[14]/(Te[10]-1),N=Te[14]/(Te[10]+1),fe=(Te[9]+1)/Te[5],le=(Te[9]-1)/Te[5],ce=(Te[8]-1)/Te[0],de=(Ae[8]+1)/Ae[0],Y=Re*ce,G=Re*de,H=Ee/(-ce+de),se=H*-ce;if(ee.matrixWorld.decompose(Z.position,Z.quaternion,Z.scale),Z.translateX(se),Z.translateZ(H),Z.matrixWorld.compose(Z.position,Z.quaternion,Z.scale),Z.matrixWorldInverse.copy(Z.matrixWorld).invert(),Te[10]===-1)Z.projectionMatrix.copy(ee.projectionMatrix),Z.projectionMatrixInverse.copy(ee.projectionMatrixInverse);else{let me=Re+H,I=N+H,T=Y-se,W=G+(Ee-se),te=fe*N/I*me,ve=le*N/I*me;Z.projectionMatrix.makePerspective(T,W,te,ve,me,I),Z.projectionMatrixInverse.copy(Z.projectionMatrix).invert()}}function F(Z,ee){ee===null?Z.matrixWorld.copy(Z.matrix):Z.matrixWorld.multiplyMatrices(ee.matrixWorld,Z.matrix),Z.matrixWorldInverse.copy(Z.matrixWorld).invert()}this.updateCamera=function(Z){if(s===null)return;let ee=Z.near,ye=Z.far;p.texture!==null&&(p.depthNear>0&&(ee=p.depthNear),p.depthFar>0&&(ye=p.depthFar)),L.near=M.near=b.near=ee,L.far=M.far=b.far=ye,(U!==L.near||V!==L.far)&&(s.updateRenderState({depthNear:L.near,depthFar:L.far}),U=L.near,V=L.far),L.layers.mask=Z.layers.mask|6,b.layers.mask=L.layers.mask&3,M.layers.mask=L.layers.mask&5;let Ee=Z.parent,Te=L.cameras;F(L,Ee);for(let Ae=0;Ae<Te.length;Ae++)F(Te[Ae],Ee);Te.length===2?J(L,b,M):L.projectionMatrix.copy(b.projectionMatrix),ie(Z,L,Ee)};function ie(Z,ee,ye){ye===null?Z.matrix.copy(ee.matrixWorld):(Z.matrix.copy(ye.matrixWorld),Z.matrix.invert(),Z.matrix.multiply(ee.matrixWorld)),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.updateMatrixWorld(!0),Z.projectionMatrix.copy(ee.projectionMatrix),Z.projectionMatrixInverse.copy(ee.projectionMatrixInverse),Z.isPerspectiveCamera&&(Z.fov=oo*2*Math.atan(1/Z.projectionMatrix.elements[5]),Z.zoom=1)}this.getCamera=function(){return L},this.getFoveation=function(){if(!(f===null&&d===null))return l},this.setFoveation=function(Z){l=Z,f!==null&&(f.fixedFoveation=Z),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=Z)},this.hasDepthSensing=function(){return p.texture!==null},this.getDepthSensingMesh=function(){return p.getMesh(L)},this.getCameraTexture=function(Z){return m[Z]};let pe=null;function ge(Z,ee){if(u=ee.getViewerPose(c||o),g=ee,u!==null){let ye=u.views;d!==null&&(e.setRenderTargetFramebuffer(v,d.framebuffer),e.setRenderTarget(v));let Ee=!1;ye.length!==L.cameras.length&&(L.cameras.length=0,Ee=!0);for(let N=0;N<ye.length;N++){let fe=ye[N],le=null;if(d!==null)le=d.getViewport(fe);else{let de=h.getViewSubImage(f,fe);le=de.viewport,N===0&&(e.setRenderTargetTextures(v,de.colorTexture,de.depthStencilTexture),e.setRenderTarget(v))}let ce=R[N];ce===void 0&&(ce=new Qt,ce.layers.enable(N),ce.viewport=new mt,R[N]=ce),ce.matrix.fromArray(fe.transform.matrix),ce.matrix.decompose(ce.position,ce.quaternion,ce.scale),ce.projectionMatrix.fromArray(fe.projectionMatrix),ce.projectionMatrixInverse.copy(ce.projectionMatrix).invert(),ce.viewport.set(le.x,le.y,le.width,le.height),N===0&&(L.matrix.copy(ce.matrix),L.matrix.decompose(L.position,L.quaternion,L.scale)),Ee===!0&&L.cameras.push(ce)}let Te=s.enabledFeatures;if(Te&&Te.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&x){h=n.getBinding();let N=h.getDepthInformation(ye[0]);N&&N.isValid&&N.texture&&p.init(N,s.renderState)}if(Te&&Te.includes("camera-access")&&x){e.state.unbindTexture(),h=n.getBinding();for(let N=0;N<ye.length;N++){let fe=ye[N].camera;if(fe){let le=m[fe];le||(le=new go,m[fe]=le);let ce=h.getCameraImage(fe);le.sourceTexture=ce}}}}for(let ye=0;ye<w.length;ye++){let Ee=S[ye],Te=w[ye];Ee!==null&&Te!==void 0&&Te.update(Ee,ee,c||o)}pe&&pe(Z,ee),ee.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ee}),g=null}let oe=new Vd;oe.setAnimationLoop(ge),this.setAnimationLoop=function(Z){pe=Z},this.dispose=function(){}}},Zs=new en,qy=new qe;function Yy(i,e){function t(p,m){p.matrixAutoUpdate===!0&&p.updateMatrix(),m.value.copy(p.matrix)}function n(p,m){m.color.getRGB(p.fogColor.value,qu(i)),m.isFog?(p.fogNear.value=m.near,p.fogFar.value=m.far):m.isFogExp2&&(p.fogDensity.value=m.density)}function s(p,m,y,_,v){m.isMeshBasicMaterial||m.isMeshLambertMaterial?r(p,m):m.isMeshToonMaterial?(r(p,m),h(p,m)):m.isMeshPhongMaterial?(r(p,m),u(p,m)):m.isMeshStandardMaterial?(r(p,m),f(p,m),m.isMeshPhysicalMaterial&&d(p,m,v)):m.isMeshMatcapMaterial?(r(p,m),g(p,m)):m.isMeshDepthMaterial?r(p,m):m.isMeshDistanceMaterial?(r(p,m),x(p,m)):m.isMeshNormalMaterial?r(p,m):m.isLineBasicMaterial?(o(p,m),m.isLineDashedMaterial&&a(p,m)):m.isPointsMaterial?l(p,m,y,_):m.isSpriteMaterial?c(p,m):m.isShadowMaterial?(p.color.value.copy(m.color),p.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function r(p,m){p.opacity.value=m.opacity,m.color&&p.diffuse.value.copy(m.color),m.emissive&&p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(p.map.value=m.map,t(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.bumpMap&&(p.bumpMap.value=m.bumpMap,t(m.bumpMap,p.bumpMapTransform),p.bumpScale.value=m.bumpScale,m.side===rn&&(p.bumpScale.value*=-1)),m.normalMap&&(p.normalMap.value=m.normalMap,t(m.normalMap,p.normalMapTransform),p.normalScale.value.copy(m.normalScale),m.side===rn&&p.normalScale.value.negate()),m.displacementMap&&(p.displacementMap.value=m.displacementMap,t(m.displacementMap,p.displacementMapTransform),p.displacementScale.value=m.displacementScale,p.displacementBias.value=m.displacementBias),m.emissiveMap&&(p.emissiveMap.value=m.emissiveMap,t(m.emissiveMap,p.emissiveMapTransform)),m.specularMap&&(p.specularMap.value=m.specularMap,t(m.specularMap,p.specularMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest);let y=e.get(m),_=y.envMap,v=y.envMapRotation;_&&(p.envMap.value=_,Zs.copy(v),Zs.x*=-1,Zs.y*=-1,Zs.z*=-1,_.isCubeTexture&&_.isRenderTargetTexture===!1&&(Zs.y*=-1,Zs.z*=-1),p.envMapRotation.value.setFromMatrix4(qy.makeRotationFromEuler(Zs)),p.flipEnvMap.value=_.isCubeTexture&&_.isRenderTargetTexture===!1?-1:1,p.reflectivity.value=m.reflectivity,p.ior.value=m.ior,p.refractionRatio.value=m.refractionRatio),m.lightMap&&(p.lightMap.value=m.lightMap,p.lightMapIntensity.value=m.lightMapIntensity,t(m.lightMap,p.lightMapTransform)),m.aoMap&&(p.aoMap.value=m.aoMap,p.aoMapIntensity.value=m.aoMapIntensity,t(m.aoMap,p.aoMapTransform))}function o(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,m.map&&(p.map.value=m.map,t(m.map,p.mapTransform))}function a(p,m){p.dashSize.value=m.dashSize,p.totalSize.value=m.dashSize+m.gapSize,p.scale.value=m.scale}function l(p,m,y,_){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.size.value=m.size*y,p.scale.value=_*.5,m.map&&(p.map.value=m.map,t(m.map,p.uvTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function c(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.rotation.value=m.rotation,m.map&&(p.map.value=m.map,t(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function u(p,m){p.specular.value.copy(m.specular),p.shininess.value=Math.max(m.shininess,1e-4)}function h(p,m){m.gradientMap&&(p.gradientMap.value=m.gradientMap)}function f(p,m){p.metalness.value=m.metalness,m.metalnessMap&&(p.metalnessMap.value=m.metalnessMap,t(m.metalnessMap,p.metalnessMapTransform)),p.roughness.value=m.roughness,m.roughnessMap&&(p.roughnessMap.value=m.roughnessMap,t(m.roughnessMap,p.roughnessMapTransform)),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)}function d(p,m,y){p.ior.value=m.ior,m.sheen>0&&(p.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),p.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(p.sheenColorMap.value=m.sheenColorMap,t(m.sheenColorMap,p.sheenColorMapTransform)),m.sheenRoughnessMap&&(p.sheenRoughnessMap.value=m.sheenRoughnessMap,t(m.sheenRoughnessMap,p.sheenRoughnessMapTransform))),m.clearcoat>0&&(p.clearcoat.value=m.clearcoat,p.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(p.clearcoatMap.value=m.clearcoatMap,t(m.clearcoatMap,p.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,t(m.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(p.clearcoatNormalMap.value=m.clearcoatNormalMap,t(m.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===rn&&p.clearcoatNormalScale.value.negate())),m.dispersion>0&&(p.dispersion.value=m.dispersion),m.iridescence>0&&(p.iridescence.value=m.iridescence,p.iridescenceIOR.value=m.iridescenceIOR,p.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(p.iridescenceMap.value=m.iridescenceMap,t(m.iridescenceMap,p.iridescenceMapTransform)),m.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=m.iridescenceThicknessMap,t(m.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),m.transmission>0&&(p.transmission.value=m.transmission,p.transmissionSamplerMap.value=y.texture,p.transmissionSamplerSize.value.set(y.width,y.height),m.transmissionMap&&(p.transmissionMap.value=m.transmissionMap,t(m.transmissionMap,p.transmissionMapTransform)),p.thickness.value=m.thickness,m.thicknessMap&&(p.thicknessMap.value=m.thicknessMap,t(m.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=m.attenuationDistance,p.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(p.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(p.anisotropyMap.value=m.anisotropyMap,t(m.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=m.specularIntensity,p.specularColor.value.copy(m.specularColor),m.specularColorMap&&(p.specularColorMap.value=m.specularColorMap,t(m.specularColorMap,p.specularColorMapTransform)),m.specularIntensityMap&&(p.specularIntensityMap.value=m.specularIntensityMap,t(m.specularIntensityMap,p.specularIntensityMapTransform))}function g(p,m){m.matcap&&(p.matcap.value=m.matcap)}function x(p,m){let y=e.get(m).light;p.referencePosition.value.setFromMatrixPosition(y.matrixWorld),p.nearDistance.value=y.shadow.camera.near,p.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Zy(i,e,t,n){let s={},r={},o=[],a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,_){let v=_.program;n.uniformBlockBinding(y,v)}function c(y,_){let v=s[y.id];v===void 0&&(g(y),v=u(y),s[y.id]=v,y.addEventListener("dispose",p));let w=_.program;n.updateUBOMapping(y,w);let S=e.render.frame;r[y.id]!==S&&(f(y),r[y.id]=S)}function u(y){let _=h();y.__bindingPointIndex=_;let v=i.createBuffer(),w=y.__size,S=y.usage;return i.bindBuffer(i.UNIFORM_BUFFER,v),i.bufferData(i.UNIFORM_BUFFER,w,S),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,_,v),v}function h(){for(let y=0;y<a;y++)if(o.indexOf(y)===-1)return o.push(y),y;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(y){let _=s[y.id],v=y.uniforms,w=y.__cache;i.bindBuffer(i.UNIFORM_BUFFER,_);for(let S=0,E=v.length;S<E;S++){let A=Array.isArray(v[S])?v[S]:[v[S]];for(let b=0,M=A.length;b<M;b++){let R=A[b];if(d(R,S,b,w)===!0){let L=R.__offset,U=Array.isArray(R.value)?R.value:[R.value],V=0;for(let X=0;X<U.length;X++){let $=U[X],K=x($);typeof $=="number"||typeof $=="boolean"?(R.__data[0]=$,i.bufferSubData(i.UNIFORM_BUFFER,L+V,R.__data)):$.isMatrix3?(R.__data[0]=$.elements[0],R.__data[1]=$.elements[1],R.__data[2]=$.elements[2],R.__data[3]=0,R.__data[4]=$.elements[3],R.__data[5]=$.elements[4],R.__data[6]=$.elements[5],R.__data[7]=0,R.__data[8]=$.elements[6],R.__data[9]=$.elements[7],R.__data[10]=$.elements[8],R.__data[11]=0):($.toArray(R.__data,V),V+=K.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,L,R.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function d(y,_,v,w){let S=y.value,E=_+"_"+v;if(w[E]===void 0)return typeof S=="number"||typeof S=="boolean"?w[E]=S:w[E]=S.clone(),!0;{let A=w[E];if(typeof S=="number"||typeof S=="boolean"){if(A!==S)return w[E]=S,!0}else if(A.equals(S)===!1)return A.copy(S),!0}return!1}function g(y){let _=y.uniforms,v=0,w=16;for(let E=0,A=_.length;E<A;E++){let b=Array.isArray(_[E])?_[E]:[_[E]];for(let M=0,R=b.length;M<R;M++){let L=b[M],U=Array.isArray(L.value)?L.value:[L.value];for(let V=0,X=U.length;V<X;V++){let $=U[V],K=x($),O=v%w,j=O%K.boundary,J=O+j;v+=j,J!==0&&w-J<K.storage&&(v+=w-J),L.__data=new Float32Array(K.storage/Float32Array.BYTES_PER_ELEMENT),L.__offset=v,v+=K.storage}}}let S=v%w;return S>0&&(v+=w-S),y.__size=v,y.__cache={},this}function x(y){let _={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(_.boundary=4,_.storage=4):y.isVector2?(_.boundary=8,_.storage=8):y.isVector3||y.isColor?(_.boundary=16,_.storage=12):y.isVector4?(_.boundary=16,_.storage=16):y.isMatrix3?(_.boundary=48,_.storage=48):y.isMatrix4?(_.boundary=64,_.storage=64):y.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",y),_}function p(y){let _=y.target;_.removeEventListener("dispose",p);let v=o.indexOf(_.__bindingPointIndex);o.splice(v,1),i.deleteBuffer(s[_.id]),delete s[_.id],delete r[_.id]}function m(){for(let y in s)i.deleteBuffer(s[y]);o=[],s={},r={}}return{bind:l,update:c,dispose:m}}var rc=class{constructor(e={}){let{canvas:t=hd(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:f=!1}=e;this.isWebGLRenderer=!0;let d;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");d=n.getContextAttributes().alpha}else d=o;let g=new Uint32Array(4),x=new Int32Array(4),p=null,m=null,y=[],_=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=jn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let v=this,w=!1;this._outputColorSpace=Kt;let S=0,E=0,A=null,b=-1,M=null,R=new mt,L=new mt,U=null,V=new we(0),X=0,$=t.width,K=t.height,O=1,j=null,J=null,F=new mt(0,0,$,K),ie=new mt(0,0,$,K),pe=!1,ge=new Sr,oe=!1,Z=!1,ee=new qe,ye=new D,Ee=new mt,Te={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ae=!1;function Re(){return A===null?O:1}let N=n;function fe(C,Q){return t.getContext(C,Q)}try{let C={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"180"}`),t.addEventListener("webglcontextlost",De,!1),t.addEventListener("webglcontextrestored",ke,!1),t.addEventListener("webglcontextcreationerror",Pe,!1),N===null){let Q="webgl2";if(N=fe(Q,C),N===null)throw fe(Q)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(C){throw console.error("THREE.WebGLRenderer: "+C.message),C}let le,ce,de,Y,G,H,se,me,I,T,W,te,ve,P,z,ne,k,ue,xe,Ie,Ge,We,Fe,Je;function q(){le=new fv(N),le.init(),We=new Gy(N,le),ce=new rv(N,le,e,We),de=new zy(N,le),ce.reversedDepthBuffer&&f&&de.buffers.depth.setReversed(!0),Y=new mv(N),G=new Ry,H=new Vy(N,le,de,G,ce,We,Y),se=new av(v),me=new hv(v),I=new Mg(N),Fe=new iv(N,I),T=new dv(N,I,Y,Fe),W=new xv(N,T,I,Y),xe=new gv(N,ce,H),ne=new ov(G),te=new Ay(v,se,me,le,ce,Fe,ne),ve=new Yy(v,G),P=new Py,z=new Uy(le),ue=new nv(v,se,me,de,W,d,l),k=new ky(v,W,ce),Je=new Zy(N,Y,ce,de),Ie=new sv(N,le,Y),Ge=new pv(N,le,Y),Y.programs=te.programs,v.capabilities=ce,v.extensions=le,v.properties=G,v.renderLists=P,v.shadowMap=k,v.state=de,v.info=Y}q();let Ce=new uh(v,N);this.xr=Ce,this.getContext=function(){return N},this.getContextAttributes=function(){return N.getContextAttributes()},this.forceContextLoss=function(){let C=le.get("WEBGL_lose_context");C&&C.loseContext()},this.forceContextRestore=function(){let C=le.get("WEBGL_lose_context");C&&C.restoreContext()},this.getPixelRatio=function(){return O},this.setPixelRatio=function(C){C!==void 0&&(O=C,this.setSize($,K,!1))},this.getSize=function(C){return C.set($,K)},this.setSize=function(C,Q,ae=!0){if(Ce.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}$=C,K=Q,t.width=Math.floor(C*O),t.height=Math.floor(Q*O),ae===!0&&(t.style.width=C+"px",t.style.height=Q+"px"),this.setViewport(0,0,C,Q)},this.getDrawingBufferSize=function(C){return C.set($*O,K*O).floor()},this.setDrawingBufferSize=function(C,Q,ae){$=C,K=Q,O=ae,t.width=Math.floor(C*ae),t.height=Math.floor(Q*ae),this.setViewport(0,0,C,Q)},this.getCurrentViewport=function(C){return C.copy(R)},this.getViewport=function(C){return C.copy(F)},this.setViewport=function(C,Q,ae,he){C.isVector4?F.set(C.x,C.y,C.z,C.w):F.set(C,Q,ae,he),de.viewport(R.copy(F).multiplyScalar(O).round())},this.getScissor=function(C){return C.copy(ie)},this.setScissor=function(C,Q,ae,he){C.isVector4?ie.set(C.x,C.y,C.z,C.w):ie.set(C,Q,ae,he),de.scissor(L.copy(ie).multiplyScalar(O).round())},this.getScissorTest=function(){return pe},this.setScissorTest=function(C){de.setScissorTest(pe=C)},this.setOpaqueSort=function(C){j=C},this.setTransparentSort=function(C){J=C},this.getClearColor=function(C){return C.copy(ue.getClearColor())},this.setClearColor=function(){ue.setClearColor(...arguments)},this.getClearAlpha=function(){return ue.getClearAlpha()},this.setClearAlpha=function(){ue.setClearAlpha(...arguments)},this.clear=function(C=!0,Q=!0,ae=!0){let he=0;if(C){let re=!1;if(A!==null){let Le=A.texture.format;re=Le===Al||Le===wl||Le===Tl}if(re){let Le=A.texture.type,Oe=Le===vn||Le===ds||Le===Rr||Le===ps||Le===Sl||Le===bl,Ye=ue.getClearColor(),Xe=ue.getClearAlpha(),tt=Ye.r,nt=Ye.g,je=Ye.b;Oe?(g[0]=tt,g[1]=nt,g[2]=je,g[3]=Xe,N.clearBufferuiv(N.COLOR,0,g)):(x[0]=tt,x[1]=nt,x[2]=je,x[3]=Xe,N.clearBufferiv(N.COLOR,0,x))}else he|=N.COLOR_BUFFER_BIT}Q&&(he|=N.DEPTH_BUFFER_BIT),ae&&(he|=N.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),N.clear(he)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",De,!1),t.removeEventListener("webglcontextrestored",ke,!1),t.removeEventListener("webglcontextcreationerror",Pe,!1),ue.dispose(),P.dispose(),z.dispose(),G.dispose(),se.dispose(),me.dispose(),W.dispose(),Fe.dispose(),Je.dispose(),te.dispose(),Ce.dispose(),Ce.removeEventListener("sessionstart",Tn),Ce.removeEventListener("sessionend",tr),_n.stop()};function De(C){C.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),w=!0}function ke(){console.log("THREE.WebGLRenderer: Context Restored."),w=!1;let C=Y.autoReset,Q=k.enabled,ae=k.autoUpdate,he=k.needsUpdate,re=k.type;q(),Y.autoReset=C,k.enabled=Q,k.autoUpdate=ae,k.needsUpdate=he,k.type=re}function Pe(C){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",C.statusMessage)}function Se(C){let Q=C.target;Q.removeEventListener("dispose",Se),Ve(Q)}function Ve(C){et(C),G.remove(C)}function et(C){let Q=G.get(C).programs;Q!==void 0&&(Q.forEach(function(ae){te.releaseProgram(ae)}),C.isShaderMaterial&&te.releaseShaderCache(C))}this.renderBufferDirect=function(C,Q,ae,he,re,Le){Q===null&&(Q=Te);let Oe=re.isMesh&&re.matrixWorld.determinant()<0,Ye=bi(C,Q,ae,he,re);de.setMaterial(he,Oe);let Xe=ae.index,tt=1;if(he.wireframe===!0){if(Xe=T.getWireframeAttribute(ae),Xe===void 0)return;tt=2}let nt=ae.drawRange,je=ae.attributes.position,vt=nt.start*tt,Ct=(nt.start+nt.count)*tt;Le!==null&&(vt=Math.max(vt,Le.start*tt),Ct=Math.min(Ct,(Le.start+Le.count)*tt)),Xe!==null?(vt=Math.max(vt,0),Ct=Math.min(Ct,Xe.count)):je!=null&&(vt=Math.max(vt,0),Ct=Math.min(Ct,je.count));let Yt=Ct-vt;if(Yt<0||Yt===1/0)return;Fe.setup(re,he,Ye,ae,Xe);let Ft,It=Ie;if(Xe!==null&&(Ft=I.get(Xe),It=Ge,It.setIndex(Ft)),re.isMesh)he.wireframe===!0?(de.setLineWidth(he.wireframeLinewidth*Re()),It.setMode(N.LINES)):It.setMode(N.TRIANGLES);else if(re.isLine){let Qe=he.linewidth;Qe===void 0&&(Qe=1),de.setLineWidth(Qe*Re()),re.isLineSegments?It.setMode(N.LINES):re.isLineLoop?It.setMode(N.LINE_LOOP):It.setMode(N.LINE_STRIP)}else re.isPoints?It.setMode(N.POINTS):re.isSprite&&It.setMode(N.TRIANGLES);if(re.isBatchedMesh)if(re._multiDrawInstances!==null)vr("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),It.renderMultiDrawInstances(re._multiDrawStarts,re._multiDrawCounts,re._multiDrawCount,re._multiDrawInstances);else if(le.get("WEBGL_multi_draw"))It.renderMultiDraw(re._multiDrawStarts,re._multiDrawCounts,re._multiDrawCount);else{let Qe=re._multiDrawStarts,Ht=re._multiDrawCounts,bt=re._multiDrawCount,Wn=Xe?I.get(Xe).bytesPerElement:1,nr=G.get(he).currentProgram.getUniforms();for(let Xn=0;Xn<bt;Xn++)nr.setValue(N,"_gl_DrawID",Xn),It.render(Qe[Xn]/Wn,Ht[Xn])}else if(re.isInstancedMesh)It.renderInstances(vt,Yt,re.count);else if(ae.isInstancedBufferGeometry){let Qe=ae._maxInstanceCount!==void 0?ae._maxInstanceCount:1/0,Ht=Math.min(ae.instanceCount,Qe);It.renderInstances(vt,Yt,Ht)}else It.render(vt,Yt)};function St(C,Q,ae){C.transparent===!0&&C.side===Wt&&C.forceSinglePass===!1?(C.side=rn,C.needsUpdate=!0,Fn(C,Q,ae),C.side=xn,C.needsUpdate=!0,Fn(C,Q,ae),C.side=Wt):Fn(C,Q,ae)}this.compile=function(C,Q,ae=null){ae===null&&(ae=C),m=z.get(ae),m.init(Q),_.push(m),ae.traverseVisible(function(re){re.isLight&&re.layers.test(Q.layers)&&(m.pushLight(re),re.castShadow&&m.pushShadow(re))}),C!==ae&&C.traverseVisible(function(re){re.isLight&&re.layers.test(Q.layers)&&(m.pushLight(re),re.castShadow&&m.pushShadow(re))}),m.setupLights();let he=new Set;return C.traverse(function(re){if(!(re.isMesh||re.isPoints||re.isLine||re.isSprite))return;let Le=re.material;if(Le)if(Array.isArray(Le))for(let Oe=0;Oe<Le.length;Oe++){let Ye=Le[Oe];St(Ye,ae,re),he.add(Ye)}else St(Le,ae,re),he.add(Le)}),m=_.pop(),he},this.compileAsync=function(C,Q,ae=null){let he=this.compile(C,Q,ae);return new Promise(re=>{function Le(){if(he.forEach(function(Oe){G.get(Oe).currentProgram.isReady()&&he.delete(Oe)}),he.size===0){re(C);return}setTimeout(Le,10)}le.get("KHR_parallel_shader_compile")!==null?Le():setTimeout(Le,10)})};let xt=null;function Vn(C){xt&&xt(C)}function Tn(){_n.stop()}function tr(){_n.start()}let _n=new Vd;_n.setAnimationLoop(Vn),typeof self<"u"&&_n.setContext(self),this.setAnimationLoop=function(C){xt=C,Ce.setAnimationLoop(C),C===null?_n.stop():_n.start()},Ce.addEventListener("sessionstart",Tn),Ce.addEventListener("sessionend",tr),this.render=function(C,Q){if(Q!==void 0&&Q.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(w===!0)return;if(C.matrixWorldAutoUpdate===!0&&C.updateMatrixWorld(),Q.parent===null&&Q.matrixWorldAutoUpdate===!0&&Q.updateMatrixWorld(),Ce.enabled===!0&&Ce.isPresenting===!0&&(Ce.cameraAutoUpdate===!0&&Ce.updateCamera(Q),Q=Ce.getCamera()),C.isScene===!0&&C.onBeforeRender(v,C,Q,A),m=z.get(C,_.length),m.init(Q),_.push(m),ee.multiplyMatrices(Q.projectionMatrix,Q.matrixWorldInverse),ge.setFromProjectionMatrix(ee,yi,Q.reversedDepth),Z=this.localClippingEnabled,oe=ne.init(this.clippingPlanes,Z),p=P.get(C,y.length),p.init(),y.push(p),Ce.enabled===!0&&Ce.isPresenting===!0){let Le=v.xr.getDepthSensingMesh();Le!==null&&Ni(Le,Q,-1/0,v.sortObjects)}Ni(C,Q,0,v.sortObjects),p.finish(),v.sortObjects===!0&&p.sort(j,J),Ae=Ce.enabled===!1||Ce.isPresenting===!1||Ce.hasDepthSensing()===!1,Ae&&ue.addToRenderList(p,C),this.info.render.frame++,oe===!0&&ne.beginShadows();let ae=m.state.shadowsArray;k.render(ae,C,Q),oe===!0&&ne.endShadows(),this.info.autoReset===!0&&this.info.reset();let he=p.opaque,re=p.transmissive;if(m.setupLights(),Q.isArrayCamera){let Le=Q.cameras;if(re.length>0)for(let Oe=0,Ye=Le.length;Oe<Ye;Oe++){let Xe=Le[Oe];qt(he,re,C,Xe)}Ae&&ue.render(C);for(let Oe=0,Ye=Le.length;Oe<Ye;Oe++){let Xe=Le[Oe];At(p,C,Xe,Xe.viewport)}}else re.length>0&&qt(he,re,C,Q),Ae&&ue.render(C),At(p,C,Q);A!==null&&E===0&&(H.updateMultisampleRenderTarget(A),H.updateRenderTargetMipmap(A)),C.isScene===!0&&C.onAfterRender(v,C,Q),Fe.resetDefaultState(),b=-1,M=null,_.pop(),_.length>0?(m=_[_.length-1],oe===!0&&ne.setGlobalState(v.clippingPlanes,m.state.camera)):m=null,y.pop(),y.length>0?p=y[y.length-1]:p=null};function Ni(C,Q,ae,he){if(C.visible===!1)return;if(C.layers.test(Q.layers)){if(C.isGroup)ae=C.renderOrder;else if(C.isLOD)C.autoUpdate===!0&&C.update(Q);else if(C.isLight)m.pushLight(C),C.castShadow&&m.pushShadow(C);else if(C.isSprite){if(!C.frustumCulled||ge.intersectsSprite(C)){he&&Ee.setFromMatrixPosition(C.matrixWorld).applyMatrix4(ee);let Oe=W.update(C),Ye=C.material;Ye.visible&&p.push(C,Oe,Ye,ae,Ee.z,null)}}else if((C.isMesh||C.isLine||C.isPoints)&&(!C.frustumCulled||ge.intersectsObject(C))){let Oe=W.update(C),Ye=C.material;if(he&&(C.boundingSphere!==void 0?(C.boundingSphere===null&&C.computeBoundingSphere(),Ee.copy(C.boundingSphere.center)):(Oe.boundingSphere===null&&Oe.computeBoundingSphere(),Ee.copy(Oe.boundingSphere.center)),Ee.applyMatrix4(C.matrixWorld).applyMatrix4(ee)),Array.isArray(Ye)){let Xe=Oe.groups;for(let tt=0,nt=Xe.length;tt<nt;tt++){let je=Xe[tt],vt=Ye[je.materialIndex];vt&&vt.visible&&p.push(C,Oe,vt,ae,Ee.z,je)}}else Ye.visible&&p.push(C,Oe,Ye,ae,Ee.z,null)}}let Le=C.children;for(let Oe=0,Ye=Le.length;Oe<Ye;Oe++)Ni(Le[Oe],Q,ae,he)}function At(C,Q,ae,he){let re=C.opaque,Le=C.transmissive,Oe=C.transparent;m.setupLightsView(ae),oe===!0&&ne.setGlobalState(v.clippingPlanes,ae),he&&de.viewport(R.copy(he)),re.length>0&&Ln(re,Q,ae),Le.length>0&&Ln(Le,Q,ae),Oe.length>0&&Ln(Oe,Q,ae),de.buffers.depth.setTest(!0),de.buffers.depth.setMask(!0),de.buffers.color.setMask(!0),de.setPolygonOffset(!1)}function qt(C,Q,ae,he){if((ae.isScene===!0?ae.overrideMaterial:null)!==null)return;m.state.transmissionRenderTarget[he.id]===void 0&&(m.state.transmissionRenderTarget[he.id]=new Lt(1,1,{generateMipmaps:!0,type:le.has("EXT_color_buffer_half_float")||le.has("EXT_color_buffer_float")?$t:vn,minFilter:Qn,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:yt.workingColorSpace}));let Le=m.state.transmissionRenderTarget[he.id],Oe=he.viewport||R;Le.setSize(Oe.z*v.transmissionResolutionScale,Oe.w*v.transmissionResolutionScale);let Ye=v.getRenderTarget(),Xe=v.getActiveCubeFace(),tt=v.getActiveMipmapLevel();v.setRenderTarget(Le),v.getClearColor(V),X=v.getClearAlpha(),X<1&&v.setClearColor(16777215,.5),v.clear(),Ae&&ue.render(ae);let nt=v.toneMapping;v.toneMapping=jn;let je=he.viewport;if(he.viewport!==void 0&&(he.viewport=void 0),m.setupLightsView(he),oe===!0&&ne.setGlobalState(v.clippingPlanes,he),Ln(C,ae,he),H.updateMultisampleRenderTarget(Le),H.updateRenderTargetMipmap(Le),le.has("WEBGL_multisampled_render_to_texture")===!1){let vt=!1;for(let Ct=0,Yt=Q.length;Ct<Yt;Ct++){let Ft=Q[Ct],It=Ft.object,Qe=Ft.geometry,Ht=Ft.material,bt=Ft.group;if(Ht.side===Wt&&It.layers.test(he.layers)){let Wn=Ht.side;Ht.side=rn,Ht.needsUpdate=!0,Gn(It,ae,he,Qe,Ht,bt),Ht.side=Wn,Ht.needsUpdate=!0,vt=!0}}vt===!0&&(H.updateMultisampleRenderTarget(Le),H.updateRenderTargetMipmap(Le))}v.setRenderTarget(Ye,Xe,tt),v.setClearColor(V,X),je!==void 0&&(he.viewport=je),v.toneMapping=nt}function Ln(C,Q,ae){let he=Q.isScene===!0?Q.overrideMaterial:null;for(let re=0,Le=C.length;re<Le;re++){let Oe=C[re],Ye=Oe.object,Xe=Oe.geometry,tt=Oe.group,nt=Oe.material;nt.allowOverride===!0&&he!==null&&(nt=he),Ye.layers.test(ae.layers)&&Gn(Ye,Q,ae,Xe,nt,tt)}}function Gn(C,Q,ae,he,re,Le){C.onBeforeRender(v,Q,ae,he,re,Le),C.modelViewMatrix.multiplyMatrices(ae.matrixWorldInverse,C.matrixWorld),C.normalMatrix.getNormalMatrix(C.modelViewMatrix),re.onBeforeRender(v,Q,ae,he,C,Le),re.transparent===!0&&re.side===Wt&&re.forceSinglePass===!1?(re.side=rn,re.needsUpdate=!0,v.renderBufferDirect(ae,Q,he,re,C,Le),re.side=xn,re.needsUpdate=!0,v.renderBufferDirect(ae,Q,he,re,C,Le),re.side=Wt):v.renderBufferDirect(ae,Q,he,re,C,Le),C.onAfterRender(v,Q,ae,he,re,Le)}function Fn(C,Q,ae){Q.isScene!==!0&&(Q=Te);let he=G.get(C),re=m.state.lights,Le=m.state.shadowsArray,Oe=re.state.version,Ye=te.getParameters(C,re.state,Le,Q,ae),Xe=te.getProgramCacheKey(Ye),tt=he.programs;he.environment=C.isMeshStandardMaterial?Q.environment:null,he.fog=Q.fog,he.envMap=(C.isMeshStandardMaterial?me:se).get(C.envMap||he.environment),he.envMapRotation=he.environment!==null&&C.envMap===null?Q.environmentRotation:C.envMapRotation,tt===void 0&&(C.addEventListener("dispose",Se),tt=new Map,he.programs=tt);let nt=tt.get(Xe);if(nt!==void 0){if(he.currentProgram===nt&&he.lightsStateVersion===Oe)return sn(C,Ye),nt}else Ye.uniforms=te.getUniforms(C),C.onBeforeCompile(Ye,v),nt=te.acquireProgram(Ye,Xe),tt.set(Xe,nt),he.uniforms=Ye.uniforms;let je=he.uniforms;return(!C.isShaderMaterial&&!C.isRawShaderMaterial||C.clipping===!0)&&(je.clippingPlanes=ne.uniform),sn(C,Ye),he.needsLights=Ui(C),he.lightsStateVersion=Oe,he.needsLights&&(je.ambientLightColor.value=re.state.ambient,je.lightProbe.value=re.state.probe,je.directionalLights.value=re.state.directional,je.directionalLightShadows.value=re.state.directionalShadow,je.spotLights.value=re.state.spot,je.spotLightShadows.value=re.state.spotShadow,je.rectAreaLights.value=re.state.rectArea,je.ltc_1.value=re.state.rectAreaLTC1,je.ltc_2.value=re.state.rectAreaLTC2,je.pointLights.value=re.state.point,je.pointLightShadows.value=re.state.pointShadow,je.hemisphereLights.value=re.state.hemi,je.directionalShadowMap.value=re.state.directionalShadowMap,je.directionalShadowMatrix.value=re.state.directionalShadowMatrix,je.spotShadowMap.value=re.state.spotShadowMap,je.spotLightMatrix.value=re.state.spotLightMatrix,je.spotLightMap.value=re.state.spotLightMap,je.pointShadowMap.value=re.state.pointShadowMap,je.pointShadowMatrix.value=re.state.pointShadowMatrix),he.currentProgram=nt,he.uniformsList=null,nt}function Rt(C){if(C.uniformsList===null){let Q=C.currentProgram.getUniforms();C.uniformsList=Fr.seqWithValue(Q.seq,C.uniforms)}return C.uniformsList}function sn(C,Q){let ae=G.get(C);ae.outputColorSpace=Q.outputColorSpace,ae.batching=Q.batching,ae.batchingColor=Q.batchingColor,ae.instancing=Q.instancing,ae.instancingColor=Q.instancingColor,ae.instancingMorph=Q.instancingMorph,ae.skinning=Q.skinning,ae.morphTargets=Q.morphTargets,ae.morphNormals=Q.morphNormals,ae.morphColors=Q.morphColors,ae.morphTargetsCount=Q.morphTargetsCount,ae.numClippingPlanes=Q.numClippingPlanes,ae.numIntersection=Q.numClipIntersection,ae.vertexAlphas=Q.vertexAlphas,ae.vertexTangents=Q.vertexTangents,ae.toneMapping=Q.toneMapping}function bi(C,Q,ae,he,re){Q.isScene!==!0&&(Q=Te),H.resetTextureUnits();let Le=Q.fog,Oe=he.isMeshStandardMaterial?Q.environment:null,Ye=A===null?v.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:_i,Xe=(he.isMeshStandardMaterial?me:se).get(he.envMap||Oe),tt=he.vertexColors===!0&&!!ae.attributes.color&&ae.attributes.color.itemSize===4,nt=!!ae.attributes.tangent&&(!!he.normalMap||he.anisotropy>0),je=!!ae.morphAttributes.position,vt=!!ae.morphAttributes.normal,Ct=!!ae.morphAttributes.color,Yt=jn;he.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(Yt=v.toneMapping);let Ft=ae.morphAttributes.position||ae.morphAttributes.normal||ae.morphAttributes.color,It=Ft!==void 0?Ft.length:0,Qe=G.get(he),Ht=m.state.lights;if(oe===!0&&(Z===!0||C!==M)){let wn=C===M&&he.id===b;ne.setState(he,C,wn)}let bt=!1;he.version===Qe.__version?(Qe.needsLights&&Qe.lightsStateVersion!==Ht.state.version||Qe.outputColorSpace!==Ye||re.isBatchedMesh&&Qe.batching===!1||!re.isBatchedMesh&&Qe.batching===!0||re.isBatchedMesh&&Qe.batchingColor===!0&&re.colorTexture===null||re.isBatchedMesh&&Qe.batchingColor===!1&&re.colorTexture!==null||re.isInstancedMesh&&Qe.instancing===!1||!re.isInstancedMesh&&Qe.instancing===!0||re.isSkinnedMesh&&Qe.skinning===!1||!re.isSkinnedMesh&&Qe.skinning===!0||re.isInstancedMesh&&Qe.instancingColor===!0&&re.instanceColor===null||re.isInstancedMesh&&Qe.instancingColor===!1&&re.instanceColor!==null||re.isInstancedMesh&&Qe.instancingMorph===!0&&re.morphTexture===null||re.isInstancedMesh&&Qe.instancingMorph===!1&&re.morphTexture!==null||Qe.envMap!==Xe||he.fog===!0&&Qe.fog!==Le||Qe.numClippingPlanes!==void 0&&(Qe.numClippingPlanes!==ne.numPlanes||Qe.numIntersection!==ne.numIntersection)||Qe.vertexAlphas!==tt||Qe.vertexTangents!==nt||Qe.morphTargets!==je||Qe.morphNormals!==vt||Qe.morphColors!==Ct||Qe.toneMapping!==Yt||Qe.morphTargetsCount!==It)&&(bt=!0):(bt=!0,Qe.__version=he.version);let Wn=Qe.currentProgram;bt===!0&&(Wn=Fn(he,Q,re));let nr=!1,Xn=!1,Xr=!1,zt=Wn.getUniforms(),ai=Qe.uniforms;if(de.useProgram(Wn.program)&&(nr=!0,Xn=!0,Xr=!0),he.id!==b&&(b=he.id,Xn=!0),nr||M!==C){de.buffers.depth.getReversed()&&C.reversedDepth!==!0&&(C._reversedDepth=!0,C.updateProjectionMatrix()),zt.setValue(N,"projectionMatrix",C.projectionMatrix),zt.setValue(N,"viewMatrix",C.matrixWorldInverse);let Nn=zt.map.cameraPosition;Nn!==void 0&&Nn.setValue(N,ye.setFromMatrixPosition(C.matrixWorld)),ce.logarithmicDepthBuffer&&zt.setValue(N,"logDepthBufFC",2/(Math.log(C.far+1)/Math.LN2)),(he.isMeshPhongMaterial||he.isMeshToonMaterial||he.isMeshLambertMaterial||he.isMeshBasicMaterial||he.isMeshStandardMaterial||he.isShaderMaterial)&&zt.setValue(N,"isOrthographic",C.isOrthographicCamera===!0),M!==C&&(M=C,Xn=!0,Xr=!0)}if(re.isSkinnedMesh){zt.setOptional(N,re,"bindMatrix"),zt.setOptional(N,re,"bindMatrixInverse");let wn=re.skeleton;wn&&(wn.boneTexture===null&&wn.computeBoneTexture(),zt.setValue(N,"boneTexture",wn.boneTexture,H))}re.isBatchedMesh&&(zt.setOptional(N,re,"batchingTexture"),zt.setValue(N,"batchingTexture",re._matricesTexture,H),zt.setOptional(N,re,"batchingIdTexture"),zt.setValue(N,"batchingIdTexture",re._indirectTexture,H),zt.setOptional(N,re,"batchingColorTexture"),re._colorsTexture!==null&&zt.setValue(N,"batchingColorTexture",re._colorsTexture,H));let li=ae.morphAttributes;if((li.position!==void 0||li.normal!==void 0||li.color!==void 0)&&xe.update(re,ae,Wn),(Xn||Qe.receiveShadow!==re.receiveShadow)&&(Qe.receiveShadow=re.receiveShadow,zt.setValue(N,"receiveShadow",re.receiveShadow)),he.isMeshGouraudMaterial&&he.envMap!==null&&(ai.envMap.value=Xe,ai.flipEnvMap.value=Xe.isCubeTexture&&Xe.isRenderTargetTexture===!1?-1:1),he.isMeshStandardMaterial&&he.envMap===null&&Q.environment!==null&&(ai.envMapIntensity.value=Q.environmentIntensity),Xn&&(zt.setValue(N,"toneMappingExposure",v.toneMappingExposure),Qe.needsLights&&Ei(ai,Xr),Le&&he.fog===!0&&ve.refreshFogUniforms(ai,Le),ve.refreshMaterialUniforms(ai,he,O,K,m.state.transmissionRenderTarget[C.id]),Fr.upload(N,Rt(Qe),ai,H)),he.isShaderMaterial&&he.uniformsNeedUpdate===!0&&(Fr.upload(N,Rt(Qe),ai,H),he.uniformsNeedUpdate=!1),he.isSpriteMaterial&&zt.setValue(N,"center",re.center),zt.setValue(N,"modelViewMatrix",re.modelViewMatrix),zt.setValue(N,"normalMatrix",re.normalMatrix),zt.setValue(N,"modelMatrix",re.matrixWorld),he.isShaderMaterial||he.isRawShaderMaterial){let wn=he.uniformsGroups;for(let Nn=0,Vc=wn.length;Nn<Vc;Nn++){let bs=wn[Nn];Je.update(bs,Wn),Je.bind(bs,Wn)}}return Wn}function Ei(C,Q){C.ambientLightColor.needsUpdate=Q,C.lightProbe.needsUpdate=Q,C.directionalLights.needsUpdate=Q,C.directionalLightShadows.needsUpdate=Q,C.pointLights.needsUpdate=Q,C.pointLightShadows.needsUpdate=Q,C.spotLights.needsUpdate=Q,C.spotLightShadows.needsUpdate=Q,C.rectAreaLights.needsUpdate=Q,C.hemisphereLights.needsUpdate=Q}function Ui(C){return C.isMeshLambertMaterial||C.isMeshToonMaterial||C.isMeshPhongMaterial||C.isMeshStandardMaterial||C.isShadowMaterial||C.isShaderMaterial&&C.lights===!0}this.getActiveCubeFace=function(){return S},this.getActiveMipmapLevel=function(){return E},this.getRenderTarget=function(){return A},this.setRenderTargetTextures=function(C,Q,ae){let he=G.get(C);he.__autoAllocateDepthBuffer=C.resolveDepthBuffer===!1,he.__autoAllocateDepthBuffer===!1&&(he.__useRenderToTexture=!1),G.get(C.texture).__webglTexture=Q,G.get(C.depthTexture).__webglTexture=he.__autoAllocateDepthBuffer?void 0:ae,he.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(C,Q){let ae=G.get(C);ae.__webglFramebuffer=Q,ae.__useDefaultFramebuffer=Q===void 0};let B=N.createFramebuffer();this.setRenderTarget=function(C,Q=0,ae=0){A=C,S=Q,E=ae;let he=!0,re=null,Le=!1,Oe=!1;if(C){let Xe=G.get(C);if(Xe.__useDefaultFramebuffer!==void 0)de.bindFramebuffer(N.FRAMEBUFFER,null),he=!1;else if(Xe.__webglFramebuffer===void 0)H.setupRenderTarget(C);else if(Xe.__hasExternalTextures)H.rebindTextures(C,G.get(C.texture).__webglTexture,G.get(C.depthTexture).__webglTexture);else if(C.depthBuffer){let je=C.depthTexture;if(Xe.__boundDepthTexture!==je){if(je!==null&&G.has(je)&&(C.width!==je.image.width||C.height!==je.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");H.setupDepthRenderbuffer(C)}}let tt=C.texture;(tt.isData3DTexture||tt.isDataArrayTexture||tt.isCompressedArrayTexture)&&(Oe=!0);let nt=G.get(C).__webglFramebuffer;C.isWebGLCubeRenderTarget?(Array.isArray(nt[Q])?re=nt[Q][ae]:re=nt[Q],Le=!0):C.samples>0&&H.useMultisampledRTT(C)===!1?re=G.get(C).__webglMultisampledFramebuffer:Array.isArray(nt)?re=nt[ae]:re=nt,R.copy(C.viewport),L.copy(C.scissor),U=C.scissorTest}else R.copy(F).multiplyScalar(O).floor(),L.copy(ie).multiplyScalar(O).floor(),U=pe;if(ae!==0&&(re=B),de.bindFramebuffer(N.FRAMEBUFFER,re)&&he&&de.drawBuffers(C,re),de.viewport(R),de.scissor(L),de.setScissorTest(U),Le){let Xe=G.get(C.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Xe.__webglTexture,ae)}else if(Oe){let Xe=Q;for(let tt=0;tt<C.textures.length;tt++){let nt=G.get(C.textures[tt]);N.framebufferTextureLayer(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0+tt,nt.__webglTexture,ae,Xe)}}else if(C!==null&&ae!==0){let Xe=G.get(C.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,Xe.__webglTexture,ae)}b=-1},this.readRenderTargetPixels=function(C,Q,ae,he,re,Le,Oe,Ye=0){if(!(C&&C.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Xe=G.get(C).__webglFramebuffer;if(C.isWebGLCubeRenderTarget&&Oe!==void 0&&(Xe=Xe[Oe]),Xe){de.bindFramebuffer(N.FRAMEBUFFER,Xe);try{let tt=C.textures[Ye],nt=tt.format,je=tt.type;if(!ce.textureFormatReadable(nt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ce.textureTypeReadable(je)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}Q>=0&&Q<=C.width-he&&ae>=0&&ae<=C.height-re&&(C.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+Ye),N.readPixels(Q,ae,he,re,We.convert(nt),We.convert(je),Le))}finally{let tt=A!==null?G.get(A).__webglFramebuffer:null;de.bindFramebuffer(N.FRAMEBUFFER,tt)}}},this.readRenderTargetPixelsAsync=async function(C,Q,ae,he,re,Le,Oe,Ye=0){if(!(C&&C.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Xe=G.get(C).__webglFramebuffer;if(C.isWebGLCubeRenderTarget&&Oe!==void 0&&(Xe=Xe[Oe]),Xe)if(Q>=0&&Q<=C.width-he&&ae>=0&&ae<=C.height-re){de.bindFramebuffer(N.FRAMEBUFFER,Xe);let tt=C.textures[Ye],nt=tt.format,je=tt.type;if(!ce.textureFormatReadable(nt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ce.textureTypeReadable(je))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let vt=N.createBuffer();N.bindBuffer(N.PIXEL_PACK_BUFFER,vt),N.bufferData(N.PIXEL_PACK_BUFFER,Le.byteLength,N.STREAM_READ),C.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+Ye),N.readPixels(Q,ae,he,re,We.convert(nt),We.convert(je),0);let Ct=A!==null?G.get(A).__webglFramebuffer:null;de.bindFramebuffer(N.FRAMEBUFFER,Ct);let Yt=N.fenceSync(N.SYNC_GPU_COMMANDS_COMPLETE,0);return N.flush(),await fd(N,Yt,4),N.bindBuffer(N.PIXEL_PACK_BUFFER,vt),N.getBufferSubData(N.PIXEL_PACK_BUFFER,0,Le),N.deleteBuffer(vt),N.deleteSync(Yt),Le}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(C,Q=null,ae=0){let he=Math.pow(2,-ae),re=Math.floor(C.image.width*he),Le=Math.floor(C.image.height*he),Oe=Q!==null?Q.x:0,Ye=Q!==null?Q.y:0;H.setTexture2D(C,0),N.copyTexSubImage2D(N.TEXTURE_2D,ae,0,0,Oe,Ye,re,Le),de.unbindTexture()};let Ne=N.createFramebuffer(),Ke=N.createFramebuffer();this.copyTextureToTexture=function(C,Q,ae=null,he=null,re=0,Le=null){Le===null&&(re!==0?(vr("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),Le=re,re=0):Le=0);let Oe,Ye,Xe,tt,nt,je,vt,Ct,Yt,Ft=C.isCompressedTexture?C.mipmaps[Le]:C.image;if(ae!==null)Oe=ae.max.x-ae.min.x,Ye=ae.max.y-ae.min.y,Xe=ae.isBox3?ae.max.z-ae.min.z:1,tt=ae.min.x,nt=ae.min.y,je=ae.isBox3?ae.min.z:0;else{let li=Math.pow(2,-re);Oe=Math.floor(Ft.width*li),Ye=Math.floor(Ft.height*li),C.isDataArrayTexture?Xe=Ft.depth:C.isData3DTexture?Xe=Math.floor(Ft.depth*li):Xe=1,tt=0,nt=0,je=0}he!==null?(vt=he.x,Ct=he.y,Yt=he.z):(vt=0,Ct=0,Yt=0);let It=We.convert(Q.format),Qe=We.convert(Q.type),Ht;Q.isData3DTexture?(H.setTexture3D(Q,0),Ht=N.TEXTURE_3D):Q.isDataArrayTexture||Q.isCompressedArrayTexture?(H.setTexture2DArray(Q,0),Ht=N.TEXTURE_2D_ARRAY):(H.setTexture2D(Q,0),Ht=N.TEXTURE_2D),N.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,Q.flipY),N.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,Q.premultiplyAlpha),N.pixelStorei(N.UNPACK_ALIGNMENT,Q.unpackAlignment);let bt=N.getParameter(N.UNPACK_ROW_LENGTH),Wn=N.getParameter(N.UNPACK_IMAGE_HEIGHT),nr=N.getParameter(N.UNPACK_SKIP_PIXELS),Xn=N.getParameter(N.UNPACK_SKIP_ROWS),Xr=N.getParameter(N.UNPACK_SKIP_IMAGES);N.pixelStorei(N.UNPACK_ROW_LENGTH,Ft.width),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,Ft.height),N.pixelStorei(N.UNPACK_SKIP_PIXELS,tt),N.pixelStorei(N.UNPACK_SKIP_ROWS,nt),N.pixelStorei(N.UNPACK_SKIP_IMAGES,je);let zt=C.isDataArrayTexture||C.isData3DTexture,ai=Q.isDataArrayTexture||Q.isData3DTexture;if(C.isDepthTexture){let li=G.get(C),wn=G.get(Q),Nn=G.get(li.__renderTarget),Vc=G.get(wn.__renderTarget);de.bindFramebuffer(N.READ_FRAMEBUFFER,Nn.__webglFramebuffer),de.bindFramebuffer(N.DRAW_FRAMEBUFFER,Vc.__webglFramebuffer);for(let bs=0;bs<Xe;bs++)zt&&(N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,G.get(C).__webglTexture,re,je+bs),N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,G.get(Q).__webglTexture,Le,Yt+bs)),N.blitFramebuffer(tt,nt,Oe,Ye,vt,Ct,Oe,Ye,N.DEPTH_BUFFER_BIT,N.NEAREST);de.bindFramebuffer(N.READ_FRAMEBUFFER,null),de.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else if(re!==0||C.isRenderTargetTexture||G.has(C)){let li=G.get(C),wn=G.get(Q);de.bindFramebuffer(N.READ_FRAMEBUFFER,Ne),de.bindFramebuffer(N.DRAW_FRAMEBUFFER,Ke);for(let Nn=0;Nn<Xe;Nn++)zt?N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,li.__webglTexture,re,je+Nn):N.framebufferTexture2D(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,li.__webglTexture,re),ai?N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,wn.__webglTexture,Le,Yt+Nn):N.framebufferTexture2D(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,wn.__webglTexture,Le),re!==0?N.blitFramebuffer(tt,nt,Oe,Ye,vt,Ct,Oe,Ye,N.COLOR_BUFFER_BIT,N.NEAREST):ai?N.copyTexSubImage3D(Ht,Le,vt,Ct,Yt+Nn,tt,nt,Oe,Ye):N.copyTexSubImage2D(Ht,Le,vt,Ct,tt,nt,Oe,Ye);de.bindFramebuffer(N.READ_FRAMEBUFFER,null),de.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else ai?C.isDataTexture||C.isData3DTexture?N.texSubImage3D(Ht,Le,vt,Ct,Yt,Oe,Ye,Xe,It,Qe,Ft.data):Q.isCompressedArrayTexture?N.compressedTexSubImage3D(Ht,Le,vt,Ct,Yt,Oe,Ye,Xe,It,Ft.data):N.texSubImage3D(Ht,Le,vt,Ct,Yt,Oe,Ye,Xe,It,Qe,Ft):C.isDataTexture?N.texSubImage2D(N.TEXTURE_2D,Le,vt,Ct,Oe,Ye,It,Qe,Ft.data):C.isCompressedTexture?N.compressedTexSubImage2D(N.TEXTURE_2D,Le,vt,Ct,Ft.width,Ft.height,It,Ft.data):N.texSubImage2D(N.TEXTURE_2D,Le,vt,Ct,Oe,Ye,It,Qe,Ft);N.pixelStorei(N.UNPACK_ROW_LENGTH,bt),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,Wn),N.pixelStorei(N.UNPACK_SKIP_PIXELS,nr),N.pixelStorei(N.UNPACK_SKIP_ROWS,Xn),N.pixelStorei(N.UNPACK_SKIP_IMAGES,Xr),Le===0&&Q.generateMipmaps&&N.generateMipmap(Ht),de.unbindTexture()},this.initRenderTarget=function(C){G.get(C).__webglFramebuffer===void 0&&H.setupRenderTarget(C)},this.initTexture=function(C){C.isCubeTexture?H.setTextureCube(C,0):C.isData3DTexture?H.setTexture3D(C,0):C.isDataArrayTexture||C.isCompressedArrayTexture?H.setTexture2DArray(C,0):H.setTexture2D(C,0),de.unbindTexture()},this.resetState=function(){S=0,E=0,A=null,de.reset(),Fe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return yi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=yt._getDrawingBufferColorSpace(e),t.unpackColorSpace=yt._getUnpackColorSpace()}};var Ky=Object.freeze({matte:{rough:.86,metal:0},satin:{rough:.46,metal:0,clearcoat:.25},glossy:{rough:.22,metal:0,clearcoat:.8},paint:{rough:.42,metal:0,clearcoat:.35},carpaint:{rough:.26,metal:.25,clearcoat:1},metal:{rough:.46,metal:.92},chrome:{rough:.13,metal:1},brass:{rough:.26,metal:1},glass:{rough:.08,metal:0,clearcoat:1,emissive:6},lens:{rough:.08,metal:0,clearcoat:1,emissive:16},bulb:{rough:.3,metal:0,emissive:45},wood:{rough:.72,metal:0},bark:{rough:.92,metal:0},leaf:{rough:.5,metal:0,flag:2},canopy:{rough:.78,metal:0,flag:1},fabric:{rough:.95,metal:0,sheen:.6},feather:{rough:.74,metal:0,sheen:.35,flag:3,normal:"feather",tint:[.76,.74,.7]},far:{rough:.95,metal:0,tint:[.16,.18,.2]},beak:{rough:.3,metal:0,clearcoat:.7},pouch:{rough:.46,metal:0,tint:[1,.8,.5]},eye:{rough:.16,metal:0,clearcoat:1},skin:{rough:.5,metal:0},wet:{rough:.1,metal:0,clearcoat:1},rubber:{rough:.9,metal:0,tint:[.82,.8,.76]},leather:{rough:.5,metal:0},stone:{rough:.84,metal:0},sand:{rough:.95,metal:0}}),$y={chrome:[14870250,13225686],brass:[15317322],metal:[4016725,3882314],carpaint:[7655352],wood:[12158037,13212262,9199418,12618325,15126430,13212254,11106111],bark:[12752491,11107410],leaf:[6077304,4629861],canopy:[7323501,5810268,7652462],glass:[16773312,16773572,16774872],lens:[16774340],bulb:[16776168],fabric:[6079406],feather:[16249574,9212835,3881551],beak:[15895596,14241838],pouch:[16371590],eye:[16776693,2564400,1907236],skin:[16172395,15764028],wet:[10471914,5605824],rubber:[15721414,5065046],leather:[12152892],stone:[14209732,15327954],sand:[15718823],matte:[8017206,8005168,16777215,14270606],far:[7312288]},dh=new Map;for(let[i,e]of Object.entries($y))for(let t of e)dh.set(t,i);function ac(i,e={}){if(e.pbr==="hide")return null;let t=typeof i=="number"?i:i&&i.isColor?i.getHex():16777215,n=e.spec??0,s=typeof e.pbr=="string"&&e.pbr||dh.get(t)||(n>=.6?"glossy":n>=.2?"satin":"matte"),r=Ky[s];if(!r)throw new Error("\u672A\u77E5\u7684\u6750\u8D28\u5206\u7C7B "+s);let o=!e.pbr&&!dh.has(t),a=fh(t>>16&255)*.2126+fh(t>>8&255)*.7152+fh(t&255)*.0722,l=o&&a>.5;return{name:s,rough:e.rough??r.rough,metal:e.metal??r.metal,clearcoat:r.clearcoat??0,sheen:r.sheen??0,emissive:e.emissiveBoost??r.emissive??0,flag:l?4:r.flag??0,normal:r.normal??null,tint:l?Jy:r.tint??[1,1,1]}}var Jy=[.74,.74,.73];function fh(i){return i/=255,i<=.04045?i/12.92:Math.pow((i+.055)/1.055,2.4)}var gs=4;function ph(){let i=()=>Array.from({length:gs},()=>new D);return{uSunDir:{value:new D(.3,.8,.5)},uLitTint:{value:new we(1,1,1)},uShadeTint:{value:new we(.6,.66,.95)},uCoreTint:{value:new we(.8,.8,.93)},uRimDir:{value:new D(-.3,.2,-.9)},uRimColor:{value:new we(1,1,1)},uRimStrength:{value:.4},uHiColor:{value:new we(1,1,1)},uTerminator:{value:.22},uCoreStart:{value:-.28},uInk:{value:new we(.13,.12,.26)},uFogColor:{value:new we(.76,.9,.97)},uFogNear:{value:70},uFogFar:{value:520},uStyle:{value:0},uPaper:{value:new we(.985,.965,.91)},uTime:{value:0},uWindDir:{value:new D(.8,0,.6).normalize()},uWindStrength:{value:1},uLampLevel:{value:0},uLampColor:{value:new we(1,.84,.56)},uLightsPos:{value:i()},uLightsDir:{value:i()},uLightsColor:{value:Array.from({length:gs},()=>new we(1,1,1))},uLightsParam:{value:Array.from({length:gs},()=>new mt(1,0,0,0))},uPixelRatio:{value:1},uViewport:{value:new be(1,1)},uCamScale:{value:1},uMode:{value:0},uBeamK:{value:1},uFogColorL:{value:new we(.45,.62,.85)},uFogDensity:{value:.0022},uOutlinePx:{value:1.6},uOutlineMul:{value:1},uFadeNear:{value:26},uFadeFar:{value:95}}}var jy=Object.keys(ph()),mh=`
vec3 srgbOETF( vec3 c ) { c = max( c, vec3( 0.0 ) ); return mix( c * 12.92, 1.055 * pow( c, vec3( 1.0 / 2.4 ) ) - 0.055, step( vec3( 0.0031308 ), c ) ); }
vec3 srgbEOTF( vec3 c ) { return mix( c / 12.92, pow( ( c + 0.055 ) / 1.055, vec3( 2.4 ) ), step( vec3( 0.04045 ), c ) ); }
`,Qy=`
#include <common>
#include <batching_pars_vertex>
#include <shadowmap_pars_vertex>
attribute vec4 aMat;    // x \u9AD8\u5149\u5F3A\u5EA6 y \u9AD8\u5149\u5C3A\u5BF8 z \u591C\u95F4\u81EA\u53D1\u5149\u63A9\u7801 w \u5173\u95ED\u8FB9\u7F18\u5149
attribute vec2 aSway;   // x \u6446\u52A8\u6743\u91CD y \u76F8\u4F4D
uniform float uTime;
uniform vec3 uWindDir;
uniform float uWindStrength;
varying vec3 vWorldPos;
varying vec3 vNormalW;
varying vec3 vAlbedo;
varying vec4 vMat;
varying vec2 vUvR;
varying float vViewZ;
void main() {
  vUvR = uv;
  #ifdef USE_COLOR
    vAlbedo = color;
  #else
    vAlbedo = vec3( 1.0 );
  #endif
  vMat = aMat;
  #include <beginnormal_vertex>
  #include <defaultnormal_vertex>
  #include <begin_vertex>
  if ( aSway.x > 0.0 ) {
    float ph = uTime * 1.25 + aSway.y + position.x * 0.07 + position.z * 0.05;
    float g = sin( ph ) * 0.6 + sin( ph * 2.17 + 1.3 ) * 0.4;
    transformed += uWindDir * ( g * 0.55 + 0.35 ) * aSway.x * uWindStrength * 0.5;
    transformed.y -= abs( g ) * aSway.x * uWindStrength * 0.12;
  }
  #include <project_vertex>
  // worldPosition \u540C\u65F6\u4F9B <shadowmap_vertex> \u4F7F\u7528
  vec4 worldPosition = vec4( transformed, 1.0 );
  #ifdef USE_BATCHING
    worldPosition = batchingMatrix * worldPosition;
  #endif
  #ifdef USE_INSTANCING
    worldPosition = instanceMatrix * worldPosition;
  #endif
  worldPosition = modelMatrix * worldPosition;
  vWorldPos = worldPosition.xyz;
  vNormalW = inverseTransformDirection( transformedNormal, viewMatrix );
  vViewZ = - mvPosition.z;
  #include <shadowmap_vertex>
}
`,e_=`
#include <common>
#include <packing>
uniform bool receiveShadow;
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
uniform vec3 uColor;
uniform float uOpacity;
uniform sampler2D uMap;
uniform float uUseMap;
uniform vec3 uEmissive;
uniform vec4 uSpec;          // x \u5F3A\u5EA6 y \u5C3A\u5BF8(0..1)
uniform float uEmissiveLevel;
uniform float uAlphaTest;
uniform float uRimMul;
uniform vec3 uSunDir, uLitTint, uShadeTint, uCoreTint, uRimDir, uRimColor, uHiColor, uInk, uFogColor, uPaper, uLampColor;
uniform float uRimStrength, uTerminator, uCoreStart, uStyle, uLampLevel, uFogNear, uFogFar, uPixelRatio;
uniform vec3 uLightsPos[ ${gs} ];
uniform vec3 uLightsDir[ ${gs} ];
uniform vec3 uLightsColor[ ${gs} ];
uniform vec4 uLightsParam[ ${gs} ];
varying vec3 vWorldPos;
varying vec3 vNormalW;
varying vec3 vAlbedo;
varying vec4 vMat;
varying vec2 vUvR;
varying float vViewZ;
// \u5E26\u5BFC\u6570\u6297\u952F\u9F7F\u7684\u8272\u9636\u8FB9\u754C\uFF1A\u8FB9\u7F18\u5BBD\u5EA6\u968F\u5C4F\u5E55\u5BFC\u6570\u81EA\u9002\u5E94\uFF0C\u659C\u9762\u4E0A\u4E5F\u4E0D\u4F1A\u51FA\u73B0\u952F\u9F7F
${mh}
float aaBand( float edge, float x ) {
  float w = fwidth( x ) * 0.7 + 0.0035;
  return smoothstep( edge - w, edge + w, x );
}
// \u5C4F\u5E55\u7A7A\u95F4\u6392\u7EBF\uFF1Aang \u65B9\u5411\u3001freq \u7EBF/px
float hatchLine( vec2 p, float ang, float freq ) {
  vec2 d = vec2( cos( ang ), sin( ang ) );
  float v = dot( p, d ) * freq;
  float f = fract( v );
  float w = fwidth( v ) * 0.7 + 0.002;
  return 1.0 - smoothstep( 0.46 - w, 0.46 + w, f );
}
void main() {
  vec3 N = normalize( vNormalW );
  #ifdef DOUBLE_SIDED
    N *= gl_FrontFacing ? 1.0 : -1.0;
  #endif
  vec3 V = normalize( cameraPosition - vWorldPos );
  // \u56FA\u6709\u8272\u4EE5\u7EBF\u6027\u7A7A\u95F4\u5B58\u50A8\uFF1B\u8D5B\u7490\u7490\u7684\u8272\u9636\u8981\u5728\u663E\u793A\u8272\u57DF\u91CC\u6DF7\u5408\uFF0C\u6240\u4EE5\u5148\u8F6C\u56DE\u663E\u793A\u8272\u57DF
  vec3 baseL = uColor * vAlbedo;
  // sRGB \u8D34\u56FE\u7531 GPU \u7684 sRGB \u50CF\u7D20\u683C\u5F0F\u5728\u91C7\u6837\u65F6\u81EA\u52A8\u89E3\u7801\uFF0C\u8FD9\u91CC\u62FF\u5230\u7684\u5DF2\u7ECF\u662F\u7EBF\u6027\u503C
  if ( uUseMap > 0.5 ) { vec4 tex = texture2D( uMap, vUvR ); baseL *= tex.rgb; if ( tex.a < uAlphaTest ) discard; }
  vec3 base = srgbOETF( baseL );

  // \u2014\u2014 \u4E3B\u5149\uFF1AN\xB7L \xD7 \u9634\u5F71\u8D34\u56FE \u2192 \u4E09\u9636 \u2014\u2014
  float ndl = dot( N, uSunDir );
  float shadow = getShadowMask();
  float lit = ndl * mix( 1.0, shadow, step( 0.0, ndl ) );
  float t1 = aaBand( uTerminator, lit );
  float t0 = aaBand( uCoreStart, lit );
  vec3 colL = base * uLitTint;
  vec3 colS = base * uShadeTint;
  vec3 colC = colS * uCoreTint;
  vec3 col = mix( mix( colC, colS, t0 ), colL, t1 );

  if ( uStyle > 0.5 ) {
    vec2 hp = gl_FragCoord.xy / uPixelRatio;
    float level = ( 1.0 - t1 ) * mix( 1.0, 0.3, t0 );
    float h = max( hatchLine( hp, 0.0, 0.15 ) * step( 0.12, level ), hatchLine( hp, 1.0472, 0.15 ) * step( 0.42, level ) );
    h = max( h, hatchLine( hp, 2.0944, 0.15 ) * step( 0.74, level ) );
    if ( uStyle < 1.5 ) {
      vec3 wash = mix( colL, uPaper, 0.42 );
      col = mix( mix( wash, colS, 0.3 ), uInk, h * 0.82 );
    } else {
      col = mix( uPaper, uInk, h * 0.9 );
    }
  }

  // \u2014\u2014 \u9AD8\u5149\u5757\uFF08\u53EA\u7ED9\u201C\u4E0A\u91C9\u201D\u7684\u8868\u9762\uFF1A\u773C\u775B\u3001\u8F66\u67B6\u3001\u5934\u76D4\u3001\u5599\uFF09\u2014\u2014
  float specStr = uSpec.x + vMat.x;
  if ( uStyle < 0.5 && specStr > 0.001 ) {
    vec3 H = normalize( uSunDir + V );
    float ndh = max( dot( N, H ), 0.0 );
    float sp = aaBand( 1.0 - max( uSpec.y, vMat.y ) * 0.16, ndh ) * step( 0.0, ndl ) * t1 * specStr;
    col = mix( col, uHiColor, sp );
  }

  // \u2014\u2014 \u8FB9\u7F18\u5149\uFF1A\u6697\u90E8\u8F6E\u5ED3\u4E0A\u7684\u4E00\u5708\u4EAE\u8FB9\uFF0C\u8BA9\u4E3B\u4F53\u4ECE\u80CC\u666F\u91CC\u201C\u5265\u201D\u51FA\u6765 \u2014\u2014
  float rimMul = uRimMul * ( 1.0 - vMat.w );
  if ( uStyle < 0.5 && rimMul > 0.001 && uRimStrength > 0.0 ) {
    float ndv = clamp( dot( N, V ), 0.0, 1.0 );
    float fres = pow( 1.0 - ndv, 3.2 );
    float back = clamp( dot( N, uRimDir ), 0.0, 1.0 );
    float rim = smoothstep( 0.22, 0.95, fres ) * ( 0.22 + 0.78 * back ) * uRimStrength * rimMul * ( 0.3 + 0.7 * ( 1.0 - t1 ) );
    col += uRimColor * rim * 0.45;
  }

  // \u2014\u2014 \u5C40\u90E8\u5149\u6E90\uFF08\u8F66\u706F / \u706F\u5854\u5149\u675F / \u8DEF\u706F\uFF09\uFF1A\u4EE5\u8272\u9636\u201C\u5149\u6591\u201D\u7684\u5F62\u5F0F\u843D\u5728\u8868\u9762 \u2014\u2014
  if ( uStyle < 1.5 ) {
    for ( int i = 0; i < ${gs}; i ++ ) {
      float range = uLightsParam[ i ].w;
      if ( range <= 0.0 ) continue;
      vec3 toL = uLightsPos[ i ] - vWorldPos;
      float dl = length( toL );
      vec3 Ld = toL / max( dl, 1e-4 );
      float att = 1.0 - smoothstep( range * 0.25, range, dl );
      float cone = uLightsParam[ i ].y >= 0.99 ? 1.0 : smoothstep( uLightsParam[ i ].y, uLightsParam[ i ].x, dot( -Ld, uLightsDir[ i ] ) );
      float band = aaBand( 0.3, max( dot( N, Ld ), 0.0 ) );
      col = mix( col, base * uLightsColor[ i ], band * att * cone * uLightsParam[ i ].z );
    }
  }

  // \u2014\u2014 \u81EA\u53D1\u5149\uFF1A\u6750\u8D28\u81EA\u5E26\uFF08\u8F66\u706F\u73BB\u7483\uFF09\u6216\u6309\u591C\u95F4\u63A9\u7801\u70B9\u4EAE\uFF08\u8DEF\u706F / \u7A97\u6237\uFF09\u2014\u2014
  if ( uEmissiveLevel > 0.001 ) col += srgbOETF( uEmissive ) * uEmissiveLevel;
  if ( uLampLevel > 0.001 && vMat.z > 0.001 ) col += base * uLampColor * vMat.z * uLampLevel;

  float fogF = smoothstep( uFogNear, uFogFar, vViewZ );
  col = mix( col, uStyle > 1.5 ? uPaper : uFogColor, fogF );
  gl_FragColor = vec4( clamp( col, 0.0, 1.0 ), uOpacity );
}
`,t_=`
attribute vec3 aOutlineN;    // \u4F4D\u7F6E\u710A\u63A5\u540E\u7684\u5E73\u6ED1\u6CD5\u7EBF\uFF1A\u786C\u8FB9\u51E0\u4F55\u4F53\u7684\u63CF\u8FB9\u624D\u4E0D\u4F1A\u5728\u68F1\u89D2\u5904\u5F00\u88C2
attribute float aOutlineW;   // \u539A\u5EA6\u500D\u7387\uFF080 = \u4E0D\u63CF\uFF09
uniform float uOutlinePx, uPixelRatio, uCamScale, uFadeNear, uFadeFar, uOutlineMul, uOutlineScale;
uniform vec2 uViewport;
varying float vViewZ;
void main() {
  vec3 n = aOutlineN;
  vec3 transformed = position;
  vec4 mvPosition = vec4( transformed, 1.0 );
  #ifdef USE_BATCHING
    mvPosition = batchingMatrix * mvPosition;
  #endif
  #ifdef USE_INSTANCING
    mvPosition = instanceMatrix * mvPosition;
    n = mat3( instanceMatrix ) * n;
  #endif
  mvPosition = modelViewMatrix * mvPosition;
  float dist = max( - mvPosition.z, 0.02 );
  float fade = 1.0 - smoothstep( uFadeNear, uFadeFar, dist );
  fade *= fade;
  float worldPerPx = uCamScale * dist / uViewport.y;   // \u8BE5\u6DF1\u5EA6\u5904\u4E00\u4E2A\u7269\u7406\u50CF\u7D20\u7684\u89C6\u7A7A\u95F4\u5C3A\u5BF8
  mvPosition.xyz += normalize( normalMatrix * n ) * ( uOutlinePx * uPixelRatio * worldPerPx * aOutlineW * fade * uOutlineMul * uOutlineScale );
  vViewZ = dist;
  gl_Position = projectionMatrix * mvPosition;
}
`,n_=`
uniform vec3 uInk, uFogColor, uPaper;
uniform float uFogNear, uFogFar, uStyle;
varying float vViewZ;
void main() {
  float f = smoothstep( uFogNear * 0.7, uFogFar, vViewZ );
  vec3 ink = uStyle > 1.5 ? uInk * 0.55 : uInk;
  gl_FragColor = vec4( mix( ink, uStyle > 1.5 ? uPaper : uFogColor, f ), 1.0 );
}
`;function i_(i){let e={};for(let t of jy)e[t]=i[t];return e}function _t(i,e,t={}){let n=new dt({lights:!0,vertexColors:!!t.vertexColors,side:t.side??xn,transparent:(t.opacity??1)<1||!!t.blending,depthWrite:t.depthWrite??(t.opacity??1)>=1,blending:t.blending??Ti,uniforms:{...Ue.lights,...i_(i),uColor:{value:new we(e??16777215)},uOpacity:{value:t.opacity??1},uMap:{value:t.map??null},uUseMap:{value:t.map?1:0},uEmissive:{value:new we(t.emissive??0)},uSpec:{value:new mt(t.spec??0,t.specSize??.5,0,0)},uEmissiveLevel:{value:t.emissiveLevel??(t.emissive?1:0)},uRimMul:{value:t.rim??1},uAlphaTest:{value:t.alphaTest??0}},vertexShader:Qy,fragmentShader:e_});return n.userData.isToon=!0,n.userData.src={color:e??16777215,pbr:t.pbr,spec:t.spec??0},n}function Yd(i){return new dt({side:rn,uniforms:{uOutlinePx:i.uOutlinePx,uPixelRatio:i.uPixelRatio,uCamScale:i.uCamScale,uFadeNear:i.uFadeNear,uFadeFar:i.uFadeFar,uOutlineMul:i.uOutlineMul,uOutlineScale:{value:1},uViewport:i.uViewport,uInk:i.uInk,uFogColor:i.uFogColor,uPaper:i.uPaper,uFogNear:i.uFogNear,uFogFar:i.uFogFar,uStyle:i.uStyle},vertexShader:t_,fragmentShader:n_})}function lc(i,e,t={}){return new dt({side:t.side??xn,transparent:!0,depthWrite:t.depthWrite??!1,blending:t.additive?fs:Ti,uniforms:{uColor:{value:new we(e??16777215)},uOpacity:{value:t.opacity??1},uFogColor:i.uFogColor,uFogNear:i.uFogNear,uFogFar:i.uFogFar,uMode:i.uMode,uFogColorL:i.uFogColorL,uFogDensity:i.uFogDensity},vertexShader:`
      varying float vViewZ;
      void main() { vec4 mv = modelViewMatrix * vec4( position, 1.0 ); vViewZ = - mv.z; gl_Position = projectionMatrix * mv; }`,fragmentShader:`
      uniform vec3 uColor, uFogColor, uFogColorL; uniform float uOpacity, uFogNear, uFogFar, uMode, uFogDensity;
      varying float vViewZ;
      ${mh}
      void main() {
        float dist = max( vViewZ, 0.0 );
        if ( uMode > 0.5 ) {                                                     // \u5199\u5B9E\uFF1A\u7EBF\u6027\u8F90\u5C04 + \u6307\u6570\u96FE\uFF0C\u4EA4\u7ED9\u540E\u671F\u505A\u8272\u8C03\u6620\u5C04
          float f = 1.0 - exp( - uFogDensity * uFogDensity * dist * dist );
          gl_FragColor = vec4( mix( uColor, uFogColorL, f ), uOpacity );
        } else {
          gl_FragColor = vec4( mix( srgbOETF( uColor ), uFogColor, smoothstep( uFogNear, uFogFar, dist ) ), uOpacity );
        }
      }`})}function cc(i,e,t={}){return new dt({side:xn,transparent:!0,depthWrite:!1,blending:fs,uniforms:{uColor:{value:new we(e??16773316)},uOpacity:{value:t.opacity??.1},uPower:{value:t.power??.8},uMode:i.uMode,uBeamK:i.uBeamK},vertexShader:`
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4( position, 1.0 );
        vN = normalize( normalMatrix * normal ); vV = normalize( - mv.xyz );
        gl_Position = projectionMatrix * mv;
      }`,fragmentShader:`
      uniform vec3 uColor; uniform float uOpacity, uPower, uMode, uBeamK;
      ${mh}
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main() {
        float along = 1.0 - pow( clamp( vUv.y, 0.0, 1.0 ), uPower );          // \u79BB\u706F\u8D8A\u8FDC\u8D8A\u6DE1
        float facing = abs( dot( normalize( vN ), normalize( vV ) ) );
        float a = uOpacity * along * ( 0.18 + 0.82 * facing * facing );
        gl_FragColor = uMode > 0.5 ? vec4( uColor * uBeamK, a ) : vec4( srgbOETF( uColor ), a );     // \u5199\u5B9E\uFF1A\u5149\u675F\u7684\u8F90\u5C04\u4EAE\u5EA6\u6309\u66DD\u5149\u6298\u7B97
      }`})}function Zd(i,e=1e-4){if(i.getAttribute("aOutlineN"))return i;let t=i.attributes.position,n=i.attributes.normal,s=t.count,r=new Float32Array(s*3),o=y=>`${Math.round(t.getX(y)/e)},${Math.round(t.getY(y)/e)},${Math.round(t.getZ(y)/e)}`,a=new Map;for(let y=0;y<s;y++){let _=o(y),v=a.get(_);v||(v=[],a.set(_,v)),v.push(y)}let l=i.index,c=l?l.count/3:s/3,u=new D,h=new D,f=new D,d=new D,g=new D,x=new D;for(let y=0;y<c;y++){let _=l?l.getX(y*3):y*3,v=l?l.getX(y*3+1):y*3+1,w=l?l.getX(y*3+2):y*3+2;u.fromBufferAttribute(t,_),h.fromBufferAttribute(t,v),f.fromBufferAttribute(t,w),x.copy(d.subVectors(h,u).cross(g.subVectors(f,u)));let S=a.get(o(_));for(let E of S)r[E*3]+=x.x,r[E*3+1]+=x.y,r[E*3+2]+=x.z}let p=new Float32Array(s*3),m=new Float32Array(s).fill(1);for(let y=0;y<s;y++){let _=r[y*3],v=r[y*3+1],w=r[y*3+2],S=Math.hypot(_,v,w);if(S<1e-12){_=n.getX(y),v=n.getY(y),w=n.getZ(y);let E=Math.hypot(_,v,w)||1;p[y*3]=_/E,p[y*3+1]=v/E,p[y*3+2]=w/E}else p[y*3]=_/S,p[y*3+1]=v/S,p[y*3+2]=w/S}return i.setAttribute("aOutlineN",new Ze(p,3)),i.getAttribute("aOutlineW")||i.setAttribute("aOutlineW",new Ze(m,1)),i}function Or(i,e,t={}){Zd(i.geometry);let n=i.geometry;n.getAttribute("normal")||n.computeVertexNormals();let s=n,r=Yd(e);r.uniforms.uOutlineScale.value=t.px??1;let o=new $e(s,r);return o.name=(i.name||"mesh")+":outline",o.castShadow=!1,o.receiveShadow=!1,o.frustumCulled=i.frustumCulled,o.renderOrder=i.renderOrder,o.userData.isOutline=!0,i.add(o),t.useNormals&&n.setAttribute("aOutlineN",n.getAttribute("normal")),o}var Et=class{constructor(e="batch"){this.name=e,this.items=[]}add(e,t,n,s={}){return this.items.push({geo:e,matrix:t,color:new we(n),o:s,cls:ac(n,s)}),this}addAt(e,t,n,s,r,o={}){let a=new qe().compose(new D(t[0],t[1],t[2]),new Ut().setFromEuler(new en(n[0],n[1],n[2])),new D(s[0],s[1],s[2]));return this.add(e,a,r,o)}build(e,{castShadow:t=!0,receiveShadow:n=!0,outline:s=!0,map:r=null}={}){let o=0,a=0;for(let M of this.items)o+=M.geo.attributes.position.count,a+=M.geo.index?M.geo.index.count:M.geo.attributes.position.count;let l=new Float32Array(o*3),c=new Float32Array(o*3),u=new Float32Array(o*3),h=new Float32Array(o*4),f=new Float32Array(o*2),d=new Float32Array(o*2),g=new Float32Array(o*3),x=new Float32Array(o),p=new Float32Array(o*4),m=o>65535?Uint32Array:Uint16Array,y=new m(a),_=new qe,v=new ot,w=new D,S=0,E=0;for(let M of this.items){let R=M.geo,L=R.attributes.position,U=L.count;_.copy(M.matrix??s_),v.getNormalMatrix(_),R.attributes.normal||R.computeVertexNormals(),Zd(R);let V=R.getAttribute("aOutlineN"),X=R.attributes.uv,$=M.o.outline??1,K=R.attributes.normal,O=M.o.spec??0,j=M.o.specSize??.5,J=M.o.lamp??0,F=M.o.noRim?1:0,ie=M.o.sway??0,pe=M.o.phase??0,ge=M.cls;for(let oe=0;oe<U;oe++){let Z=(S+oe)*3,ee=(S+oe)*2,ye=(S+oe)*4;w.fromBufferAttribute(L,oe).applyMatrix4(_),l[Z]=w.x,l[Z+1]=w.y,l[Z+2]=w.z,w.fromBufferAttribute(K,oe).applyMatrix3(v).normalize(),c[Z]=w.x,c[Z+1]=w.y,c[Z+2]=w.z,w.fromBufferAttribute(V,oe).applyMatrix3(v).normalize(),g[Z]=w.x,g[Z+1]=w.y,g[Z+2]=w.z,u[Z]=M.color.r,u[Z+1]=M.color.g,u[Z+2]=M.color.b,h[ye]=O,h[ye+1]=j,h[ye+2]=J,h[ye+3]=F,f[ee]=ie,f[ee+1]=pe,d[ee]=X?X.getX(oe):0,d[ee+1]=X?X.getY(oe):0,x[S+oe]=$,p[ye]=ge.rough,p[ye+1]=ge.metal,p[ye+2]=ge.flag,p[ye+3]=ge.clearcoat}if(R.index)for(let oe=0;oe<R.index.count;oe++)y[E+oe]=R.index.getX(oe)+S;else for(let oe=0;oe<U;oe++)y[E+oe]=oe+S;S+=U,E+=R.index?R.index.count:U}let A=new ft;A.setAttribute("position",new Ze(l,3)),A.setAttribute("normal",new Ze(c,3)),A.setAttribute("color",new Ze(u,3)),A.setAttribute("aMat",new Ze(h,4)),A.setAttribute("aSway",new Ze(f,2)),A.setAttribute("uv",new Ze(d,2)),A.setAttribute("aOutlineN",new Ze(g,3)),A.setAttribute("aOutlineW",new Ze(x,1)),A.setAttribute("aPBR",new Ze(p,4)),A.setIndex(new Ze(y,1)),A.computeBoundingSphere(),A.computeBoundingBox();let b=new $e(A,_t(e,16777215,{vertexColors:!0,map:r}));if(b.name=this.name,b.castShadow=t,b.receiveShadow=n,s){let M=new $e(A,Yd(e));M.name=this.name+":outline",M.castShadow=!1,M.receiveShadow=!1,M.userData.isOutline=!0,b.add(M)}return this.items.length=0,b}},s_=new qe;var He=Math.PI*2,ni=Math.PI/180,ct=(i,e,t)=>i<e?e:i>t?t:i,wt=i=>i<0?0:i>1?1:i,st=(i,e,t)=>i+(e-i)*t;var kn=(i,e,t)=>{let n=wt((t-i)/(e-i));return n*n*(3-2*n)};var pn=(i,e,t,n)=>st(i,e,1-Math.exp(-t*n));var Kd=i=>(i=(i+Math.PI)%He,i<0&&(i+=He),i-Math.PI);function Pn(i){let e=i>>>0;return function(){e=e+1831565813>>>0;let t=e;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}function gh(i){let e=Math.imul(i^2654435769,2246822507);return e^=e>>>13,e=Math.imul(e,3266489909),e^=e>>>16,(e>>>0)/4294967296}var uc=i=>i*i*(3-2*i);function hc(i,e=0){let t=Math.floor(i),n=i-t,s=gh(t*374761393+e*668265263)*2-1,r=gh((t+1)*374761393+e*668265263)*2-1;return st(s,r,uc(n))}function fc(i,e,t=0){let n=Math.floor(i),s=Math.floor(e),r=i-n,o=e-s,a=(f,d)=>gh(f*374761393+d*668265263^t*2246822519)*2-1,l=a(n,s),c=a(n+1,s),u=a(n,s+1),h=a(n+1,s+1);return st(st(l,c,uc(r)),st(u,h,uc(r)),uc(o))}function dc(i,e,t=3,n=0){let s=0,r=.5,o=1,a=0;for(let l=0;l<t;l++)s+=fc(i*o,e*o,n+l*17)*r,a+=r,r*=.5,o*=2.03;return s/a}function Mi(i,e,t){let n=i.length;if(n===1||t<=i[0])return e[0];if(t>=i[n-1])return e[n-1];let s=0;for(;s<n-2&&t>i[s+1];)s++;let r=x=>(e[x+1]-e[x])/(i[x+1]-i[x]),o=x=>{if(x<=0)return r(0);if(x>=n-1)return r(n-2);let p=r(x-1),m=r(x);if(p*m<=0)return 0;let y=3*Math.min(Math.abs(p),Math.abs(m));return ct((p+m)*.5,-y,y)},a=i[s+1]-i[s],l=(t-i[s])/a,c=l*l,u=c*l,h=2*u-3*c+1,f=u-2*c+l,d=-2*u+3*c,g=u-c;return h*e[s]+f*a*o(s)+d*e[s+1]+g*a*o(s+1)}function xh(i,e,t,n,s){let r=-t*(i.x-e)-n*i.v;return i.v+=r*s,i.x+=i.v*s,i}function vh(i=0){return{x:i,v:0}}function $d(i,e,t={}){let n=new rc({canvas:i,antialias:!0,powerPreference:"high-performance",alpha:!1,stencil:!1});n.outputColorSpace=_i,n.toneMapping=jn,n.info.autoReset=!1,n.shadowMap.enabled=!0,n.shadowMap.type=il,n.shadowMap.autoUpdate=!1,n.setClearColor(10474474,1);let s=new po,r=new Qt(t.fov??36,16/9,.08,5e3),o=new Do(16777215,1);o.castShadow=!0,o.shadow.mapSize.set(t.shadowSize??2048,t.shadowSize??2048),o.shadow.bias=-35e-5,o.shadow.normalBias=.025;let a=o.shadow.camera;a.left=a.bottom=-(t.shadowExtent??15),a.right=a.top=t.shadowExtent??15,a.near=1,a.far=260,a.updateProjectionMatrix(),s.add(o),s.add(o.target);let l=1;function c(m,y,_){l=Math.min(_,t.maxDpr??2),n.setPixelRatio(l),n.setSize(m,y,!1),r.aspect=m/y,r.updateProjectionMatrix(),u()}function u(){let m=new be;n.getDrawingBufferSize(m),e.uViewport.value.copy(m),e.uPixelRatio.value=n.getPixelRatio();let y=Math.tan(r.fov*ni/2);e.uCamScale.value=r.isPerspectiveCamera?2*y:2/r.zoom}function h(m){a.right!==m&&(a.left=a.bottom=-m,a.right=a.top=m,a.updateProjectionMatrix())}let f=new D(0,1,0);function d(m,y){let _=m.sunAz*ni,v=m.sunEl*ni,w=Math.cos(v);f.set(Math.sin(_)*w,Math.sin(v),Math.cos(_)*w).normalize(),e.uSunDir.value.copy(f),e.uLitTint.value.setRGB(...m.litTint),e.uShadeTint.value.setRGB(...m.shadeTint),e.uCoreTint.value.setRGB(...m.coreTint),e.uRimColor.value.setRGB(...m.rimColor),e.uRimStrength.value=m.rimStrength,e.uHiColor.value.setRGB(Math.min(1,m.litTint[0]+.25),Math.min(1,m.litTint[1]+.22),Math.min(1,m.litTint[2]+.16)),e.uRimDir.value.set(-f.x,.28,-f.z).normalize(),e.uTerminator.value=m.terminator,e.uInk.value.setRGB(...m.ink),e.uFogColor.value.setRGB(...m.skyHorizon),e.uFogNear.value=110/m.fogDensity,e.uFogFar.value=900/m.fogDensity,e.uLampLevel.value=m.lamps,n.setClearColor(new we(...m.skyHorizon),1),y&&(o.position.copy(y).addScaledVector(f,90),o.target.position.copy(y),o.target.updateMatrixWorld(),o.color.set(16777215),o.intensity=1,o.castShadow=p.shadowEnabled&&m.sunEl>3)}let g={calls:0,triangles:0,frame:0};function x(m){n.info.reset(),m?m():n.render(s,r),g.calls=n.info.render.calls,g.triangles=n.info.render.triangles,g.frame++}let p={renderer:n,scene:s,camera:r,sun:o,resize:c,syncCameraUniforms:u,applyPalette:d,render:x,stats:g,shadowEnabled:!0,setShadowExtent:h,get pixelRatio(){return l}};return p}var yn=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},r_=new Vs(-1,1,1,-1,0,1),yh=class extends ft{constructor(){super(),this.setAttribute("position",new ut([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new ut([0,2,0,0,2,0],2))}},o_=new yh,Hn=class{constructor(e){this._mesh=new $e(o_,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,r_)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}};var Dt=Object.freeze({R0:636e4,R1:642e4,HR:8e3,HM:1200,BETA_R:[55e-7,13e-6,224e-7],BETA_M:21e-6,BETA_O3:[65e-8,1881e-9,85e-9]}),Wo=Object.freeze({W:128,H:48,TOP:8e4,SHADOW:1e5}),a_=24,Xo=Object.freeze({zenith:[.0022,.004,.0105],horizon:[.0075,.011,.02]}),l_=i=>Wo.TOP*i*i,c_=i=>{let e=2*i-1;return e*Math.abs(e)};function Jd(i,e){return e[0]=Math.exp(-i/Dt.HR),e[1]=Math.exp(-i/Dt.HM),e[2]=Math.max(0,1-Math.abs(i-25e3)/15e3),e}function jd(){let{W:i,H:e}=Wo,t=new Float32Array(i*e*4),n=96,s=[0,0,0],r=[0,0,0];for(let o=0;o<e;o++){let a=l_((o+.5)/e),l=Dt.R0+a;for(let c=0;c<i;c++){let u=c_((c+.5)/i),h=(o*i+c)*4,f=l*u,d=f*f-(l*l-Dt.R0*Dt.R0);if(d>0&&-f-Math.sqrt(d)>0){t[h]=t[h+1]=t[h+2]=Wo.SHADOW;continue}let g=Math.sqrt(Math.max(0,1-u*u)),x=-f+Math.sqrt(Math.max(f*f-(l*l-Dt.R1*Dt.R1),0));Jd(a,s);let p=0,m=0,y=0,_=0,v=a;for(let w=1;w<=n;w++){let S=x*(w/n)**3,E=g*S,A=l+u*S,b=Math.max(Math.sqrt(E*E+A*A)-Dt.R0,0),M=b-v;Jd(b,r);let R=(L,U,V)=>Math.abs(M)<1e-4?(S-_)*U:(S-_)/M*L*(U-V);p+=R(Dt.HR,s[0],r[0]),m+=R(Dt.HM,s[1],r[1]),y+=.5*(s[2]+r[2])*(S-_),_=S,v=b,s[0]=r[0],s[1]=r[1],s[2]=r[2]}t[h]=p,t[h+1]=m,t[h+2]=y}}return t}function pc(i,e,t,n=[0,0,0]){let{W:s,H:r}=Wo,o=wt(t*.5+.5)*2-1,a=Math.sqrt(wt(e/Wo.TOP))*r-.5,l=(Math.sqrt(Math.abs(o))*Math.sign(o)+1)*.5*s-.5,c=Math.max(0,Math.min(r-1,Math.floor(a))),u=Math.max(0,Math.min(s-1,Math.floor(l))),h=Math.min(r-1,c+1),f=Math.min(s-1,u+1),d=wt(a-c),g=wt(l-u);for(let x=0;x<3;x++){let p=i[(c*s+u)*4+x],m=i[(c*s+f)*4+x],y=i[(h*s+u)*4+x],_=i[(h*s+f)*4+x];n[x]=st(st(p,m,g),st(y,_,g),d)}return n}function _h(i,e,t,n,s,r=[0,0,0]){let o=pc(i,e,t);for(let a=0;a<3;a++)r[a]=Math.exp(-(Dt.BETA_R[a]*s*o[0]+Dt.BETA_M*n*o[1]+Dt.BETA_O3[a]*o[2]));return r}function Qd(i,e,t,n,s={}){let r=s.samples??a_,o=n.turbidity??2.5,a=n.rayleigh??1,l=n.mieG??.8,c=n.sunE??7,u=Math.hypot(e[0],Math.max(e[1],0),e[2])||1,h=e[0]/u,f=Math.max(e[1],0)/u,d=e[2]/u,g=Dt.R0*f,x=-g+Math.sqrt(g*g-(Dt.R0*Dt.R0-Dt.R1*Dt.R1)),p=Dt.BETA_R.map(O=>O*a),m=Dt.BETA_M*o,y=[0,0,0],_=[0,0,0],v=[0,0,0],w=[0,0,0];for(let O=0;O<r;O++){let j=(O/r)**3,J=((O+1)/r)**3,F=x*.5*(j+J),ie=x*(J-j),pe=h*F,ge=Dt.R0+f*F,oe=d*F,Z=Math.sqrt(pe*pe+ge*ge+oe*oe),ee=Z-Dt.R0,ye=pe/Z,Ee=ge/Z,Te=oe/Z,Ae=pc(i,ee,ye*h+Ee*f+Te*d,v),Re=pc(i,ee,ye*t[0]+Ee*t[1]+Te*t[2],w),N=Math.exp(-ee/Dt.HR),fe=Math.exp(-ee/Dt.HM);for(let le=0;le<3;le++){let ce=Math.exp(-(p[le]*Ae[0]+m*Ae[1]+Dt.BETA_O3[le]*Ae[2]))*Math.exp(-(p[le]*Re[0]+m*Re[1]+Dt.BETA_O3[le]*Re[2]));y[le]+=ce*N*ie,_[le]+=ce*fe*ie}}let S=h*t[0]+f*t[1]+d*t[2],E=l*l,A=3/(16*Math.PI)*(1+S*S),b=3/(8*Math.PI)*((1-E)*(1+S*S))/((2+E)*Math.pow(1+E-2*l*S,1.5)),M=[0,0,0],R=[0,0,0],L=[0,0,0];_h(i,0,t[1],o,a,R);let U=pc(i,0,t[1],v),V=1-Math.exp(-(p[0]+p[1]+p[2])/3*U[0]);for(let O=0;O<3;O++)L[O]=V*Dt.BETA_R[O]*a/13333e-9;let X=wt((t[1]+.05)/.1),$=(n.multiScatter??.12)*X*X*(3-2*X),K=.72+.28*(1-f)*(1-f);for(let O=0;O<3;O++)M[O]=c*(y[O]*p[O]*A+_[O]*m*b+$*K*L[O]);return{rgb:M,sunT:R}}function ep(i,e=[0,0,0]){let t=(1-Math.max(i[1],0))**3;for(let n=0;n<3;n++)e[n]=st(Xo.zenith[n],Xo.horizon[n],t);return e}var tp=i=>.2126*i[0]+.7152*i[1]+.0722*i[2];function Mh(i,e){let t=i*Math.PI/180,n=e*Math.PI/180,s=Math.cos(n);return[Math.sin(t)*s,Math.sin(n),Math.cos(t)*s]}var Js=7,gc=.76,np=.12,xs=(i,e,t,n,s,r)=>({sunEl:i,turbidity:e,cloud:t,fog:n,exposure:s,mist:r}),Sh=xs(-34,2.8,.3,.00135,7,.25),mc=Object.freeze([{h:0,p:Sh},{h:4.4,p:Sh},{h:6,p:xs(5,3.6,.46,.0013,1.5,.8)},{h:8.6,p:xs(30,2.4,.4,85e-5,.78,.3)},{h:12.6,p:xs(66,1.6,.34,62e-5,.72,0)},{h:15.8,p:xs(40,2,.42,7e-4,.76,0)},{h:18.2,p:xs(6.5,3.8,.4,95e-5,.95,.1)},{h:19.3,p:xs(-5.5,3.4,.34,.00115,2.7,.5)},{h:20.6,p:xs(-24,2.8,.3,.00135,7,.25)},{h:24,p:Sh}]);function ip(i,e={}){i=(i%24+24)%24;let t=0;for(;t<mc.length-2&&i>=mc[t+1].h;)t++;let n=mc[t],s=mc[t+1],r=wt((i-n.h)/(s.h-n.h)),o=r*r*(3-2*r);for(let a of Object.keys(n.p))e[a]=st(n.p[a],s.p[a],o);return e.hour=i,e}function sp(i){return u_(-2,-6,i)}function u_(i,e,t){let n=wt((t-i)/(e-i));return n*n*(3-2*n)}var bh=i=>typeof i=="number"?i.toFixed(3):i,rp=`
const float SKY_R0 = 6360e3;
const float SKY_R1 = 6420e3;
const float SKY_HR = 8000.0;
const float SKY_HM = 1200.0;
const vec3 SKY_BR = vec3( 5.5e-6, 13.0e-6, 22.4e-6 );
const float SKY_BM = 21e-6;
const vec3 SKY_BO3 = vec3( 0.65e-6, 1.881e-6, 0.085e-6 );
const float SKY_PI = 3.14159265358979;
const float SKY_SUN_E = ${bh(Js)};
const float SKY_MIE_G = ${bh(gc)};
const float SKY_MS = ${bh(np)};
uniform sampler2D tSkyLut;
const float SKY_LUT_W = 128.0;
const float SKY_LUT_H = 48.0;
const float SKY_LUT_TOP = 80000.0;
const int SKY_SAMPLES = 24;

// \u900F\u5C04\u7387\u8868\u53D6\u6837\uFF08\u624B\u52A8\u53CC\u7EBF\u6027\uFF09\uFF1Argb = (\u745E\u5229\u5149\u7A0B, \u7C73\u6C0F\u5149\u7A0B, \u81ED\u6C27\u5149\u7A0B)
vec3 skyLut( float h, float c ) {
  float s = clamp( c, - 1.0, 1.0 );
  vec2 t = vec2( ( sqrt( abs( s ) ) * sign( s ) + 1.0 ) * 0.5 * SKY_LUT_W, sqrt( clamp( h / SKY_LUT_TOP, 0.0, 1.0 ) ) * SKY_LUT_H ) - 0.5;
  vec2 i0 = clamp( floor( t ), vec2( 0.0 ), vec2( SKY_LUT_W - 1.0, SKY_LUT_H - 1.0 ) );
  vec2 i1 = min( i0 + 1.0, vec2( SKY_LUT_W - 1.0, SKY_LUT_H - 1.0 ) );
  vec2 f = clamp( t - i0, vec2( 0.0 ), vec2( 1.0 ) );
  ivec2 a = ivec2( i0 ), b = ivec2( i1 );
  vec3 v00 = texelFetch( tSkyLut, a, 0 ).rgb, v10 = texelFetch( tSkyLut, ivec2( b.x, a.y ), 0 ).rgb;
  vec3 v01 = texelFetch( tSkyLut, ivec2( a.x, b.y ), 0 ).rgb, v11 = texelFetch( tSkyLut, b, 0 ).rgb;
  return mix( mix( v00, v10, f.x ), mix( v01, v11, f.x ), f.y );
}
vec3 skyExtinct( vec3 extR, float extM, vec3 od ) { return exp( - ( extR * od.x + extM * od.y + SKY_BO3 * od.z ) ); }

// \u6CBF\u89C6\u7EBF\u7684\u5185\u6563\u5C04\uFF08\u7EBF\u6027\u8F90\u5C04\uFF09\u3002\u89C6\u7EBF\u843D\u5230\u5730\u5E73\u7EBF\u4EE5\u4E0B\u65F6\u6309\u8D34\u5730\u5904\u7406\u3002sunT = \u4ECE\u6D77\u5E73\u9762\u770B\u5411\u592A\u9633\u7684\u900F\u5C04\u7387\uFF08\u76F4\u5C04\u5149\u989C\u8272\uFF09\u3002
vec3 skyScatter( vec3 dir, vec3 sun, float turbidity, float rayleigh, float mieG, float sunE, float multiScatter, out vec3 sunT ) {
  dir = normalize( vec3( dir.x, max( dir.y, 0.0 ), dir.z ) );
  vec3 extR = SKY_BR * rayleigh, extM = vec3( SKY_BM * turbidity );
  float b = SKY_R0 * dir.y;
  float tMax = - b + sqrt( b * b - ( SKY_R0 * SKY_R0 - SKY_R1 * SKY_R1 ) );
  vec3 sumR = vec3( 0.0 ), sumM = vec3( 0.0 );
  for ( int i = 0; i < SKY_SAMPLES; i ++ ) {
    float f0 = pow( float( i ) / float( SKY_SAMPLES ), 3.0 ), f1 = pow( float( i + 1 ) / float( SKY_SAMPLES ), 3.0 );
    float t = tMax * 0.5 * ( f0 + f1 ), dt = tMax * ( f1 - f0 );          // \u6BB5\u4E2D\u70B9 + \u6BB5\u957F\uFF08\u6B65\u957F\u4E09\u6B21\u65B9\u5206\u5E03\uFF1A\u8FD1\u5904\u5BC6\uFF09
    vec3 p = vec3( 0.0, SKY_R0, 0.0 ) + dir * t;
    float r = length( p ), h = max( r - SKY_R0, 0.0 );
    vec3 up = p / r;
    vec3 T = skyExtinct( extR, extM.x, skyLut( h, dot( up, dir ) ) ) * skyExtinct( extR, extM.x, skyLut( h, dot( up, sun ) ) );
    sumR += T * exp( - h / SKY_HR ) * dt;
    sumM += T * exp( - h / SKY_HM ) * dt;
  }
  float mu = dot( dir, sun ), g2 = mieG * mieG;
  float phR = 3.0 / ( 16.0 * SKY_PI ) * ( 1.0 + mu * mu );
  float phM = 3.0 / ( 8.0 * SKY_PI ) * ( ( 1.0 - g2 ) * ( 1.0 + mu * mu ) ) / ( ( 2.0 + g2 ) * pow( 1.0 + g2 - 2.0 * mieG * mu, 1.5 ) );
  vec3 od0 = skyLut( 0.0, sun.y );
  sunT = skyExtinct( extR, extM.x, od0 );
  float w = 0.72 + 0.28 * ( 1.0 - dir.y ) * ( 1.0 - dir.y );             // \u591A\u6B21\u6563\u5C04\uFF1A\u5E73\u5766\u5E95\u5149\uFF0C\u5730\u5E73\u7EBF\u7565\u591A
  float s0 = smoothstep( - 0.05, 0.05, sun.y );                           // \u6765\u6E90\u662F\u672C\u5730\u5DF2\u88AB\u6563\u5C04\u7684\u9633\u5149\uFF1A\u592A\u9633\u843D\u4E0B\u540E\u968F\u76F4\u5C04\u5149\u4E00\u8D77\u7184\u706D
  float lost = 1.0 - exp( - dot( SKY_BR, vec3( 0.333333 ) ) * rayleigh * od0.x );    // \u88AB\u745E\u5229\u6563\u5C04\u6389\u7684\u9633\u5149
  return sunE * ( sumR * extR * phR + sumM * extM * phM + multiScatter * s0 * w * lost * ( SKY_BR * rayleigh / 1.3333e-5 ) );
}
`;var op=.085,Br=[.62,.72,1],h_=256,f_=128,d_=`vec3 nightGlow( vec3 d ) { float t = pow( 1.0 - max( d.y, 0.0 ), 3.0 ); return mix( vec3( ${Xo.zenith.join(", ")} ), vec3( ${Xo.horizon.join(", ")} ), t ); }`,xc=`
vec2 equirectUv2( vec3 d ) { return vec2( atan( d.z, d.x ) / 6.2831853 + 0.5, asin( clamp( d.y, - 1.0, 1.0 ) ) / 3.1415927 + 0.5 ); }
`,p_=`
varying vec2 vUv;
uniform vec3 uSun;
uniform float uTurbidity, uNight;
${rp}
${d_}
void main() {
  float az = ( vUv.x - 0.5 ) * 6.2831853, el = ( vUv.y - 0.5 ) * 3.1415927;
  vec3 d = vec3( cos( el ) * cos( az ), sin( el ), cos( el ) * sin( az ) );
  vec3 sunT;
  vec3 col = skyScatter( d, uSun, uTurbidity, 1.0, SKY_MIE_G, SKY_SUN_E, SKY_MS, sunT );
  col += nightGlow( d ) * uNight;
  gl_FragColor = vec4( col, 1.0 );
}
`,m_=(i,e,t)=>{let n=Math.min(1,Math.max(0,(t-i)/(e-i)));return n*n*(3-2*n)};function ap(i,e,t,n,s={}){let r=Mh(t,e.sunEl),o={turbidity:e.turbidity,mieG:gc,sunE:Js},a=sp(e.sunEl),l=[0,0,0],c=_h(i,0,r[1],e.turbidity,1);s.sunDir=r,s.sunT=c,s.sunE=Js*m_(-.012,.02,r[1]),s.night=a,s.moonDir=n.slice(),s.moonE=op*a;let u=[0,0,0],h=[0,0,0],f=[0,0,0],d=[0,0,0],g=(p,m,y,_)=>{let v=Mh(m,y),w=Qd(i,v,r,o).rgb;ep(v,l);for(let S=0;S<3;S++)p[S]+=_*(w[S]+l[S]*a)};for(let p of[67.5,112.5,157.5,202.5,247.5,292.5])g(u,t+p,5,1/6);g(h,t,8,1),g(f,t+180,90,1),g(d,t+60,30,1);let x=[0,0,0];for(let p=0;p<3;p++)x[p]=Math.PI*(.18*f[p]+.52*d[p]+.3*u[p]);return s.fog=u,s.fogSun=h,s.irr=x,s.isMoon=tp(c)*s.sunE<op*a*.8,s}function lp(i){let e=performance.now(),t=jd(),n=new ui(t,128,48,dn,ei);n.minFilter=n.magFilter=Zt,n.needsUpdate=!0;let s=new Lt(h_,f_,{type:$t,minFilter:fn,magFilter:fn,depthBuffer:!1,stencilBuffer:!1,generateMipmaps:!1});s.texture.wrapS=bn,s.texture.wrapT=On;let r=new dt({uniforms:{tSkyLut:{value:n},uSun:{value:new D(0,1,0)},uTurbidity:{value:2.5},uNight:{value:0}},vertexShader:"varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4( position.xy, 0.0, 1.0 ); }",fragmentShader:p_,depthTest:!1,depthWrite:!1}),o=new Hn(r),a=new Nr(i),l=null,c=null;function u(h,f,d,g=!1){let x=c&&!g&&c.night===d&&Math.abs(c.turbidity-f)<.02&&c.sun.x*h[0]+c.sun.y*h[1]+c.sun.z*h[2]>.99999;if(r.uniforms.uSun.value.set(h[0],h[1],h[2]),x&&l)return{envMap:l,changed:!1};r.uniforms.uTurbidity.value=f,r.uniforms.uNight.value=d;let p=i.getRenderTarget();i.setRenderTarget(s),o.render(i),i.setRenderTarget(p);let m=l;return l=a.fromEquirectangular(s.texture).texture,m&&m.dispose(),c={sun:new D(h[0],h[1],h[2]),turbidity:f,night:d},{envMap:l,changed:!0}}return{lut:t,texture:s.texture,update:u,get envMap(){return l},buildMs:Math.round(performance.now()-e)}}function mn(i){let e=i>>>0;return()=>{e=e+1831565813|0;let t=Math.imul(e^e>>>15,1|e);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}var Eh=i=>i*i*(3-2*i),Th=i=>i-Math.floor(i),kt=class{constructor(e,t,n){this.fx=e,this.fy=t,this.v=new Float32Array(e*t);let s=mn(n);for(let r=0;r<e*t;r++)this.v[r]=s()}at(e,t){let{fx:n,fy:s,v:r}=this,o=Th(e)*n,a=Th(t)*s,l=Math.floor(o),c=Math.floor(a),u=Eh(o-l),h=Eh(a-c),f=l%n,d=(f+1)%n,g=c%s,x=(g+1)%s,p=r[g*n+f],m=r[g*n+d],y=r[x*n+f],_=r[x*n+d];return(p+(m-p)*u)*(1-h)+(y+(_-y)*u)*h}};function wh(i,e,t,n){let s=0;for(let r=0;r<t.length;r++)s+=n[r]*t[r].at(i,e);return s}function Ah(i,e,t,n={}){let s=new ui(i,e,t,dn,vn);return s.colorSpace=n.srgb?Kt:ti,s.wrapS=s.wrapT=bn,s.anisotropy=n.aniso??8,s.generateMipmaps=!0,s.minFilter=Qn,s.magFilter=fn,s.needsUpdate=!0,s}var Zi=i=>i<0?0:i>1?1:i;function vc(i,e,t,n){let s=new Uint8Array(i*e*4),r=[0,0,0,255];for(let o=0;o<e;o++)for(let a=0;a<i;a++){r[3]=255,t((a+.5)/i,(o+.5)/e,a,o,r);let l=(o*i+a)*4;s[l]=r[0],s[l+1]=r[1],s[l+2]=r[2],s[l+3]=r[3]}return Ah(s,i,e,{srgb:!0,...n})}function js(i,e,t,n){let s=new Uint8Array(i*e*4);for(let r=0;r<e;r++)for(let o=0;o<i;o++){let a=t[r*i+(o+1)%i]-t[r*i+(o-1+i)%i],l=t[(r+1)%e*i+o]-t[(r-1+e)%e*i+o],c=-a*n,u=-l*n,h=Math.hypot(c,u,1),f=(r*i+o)*4;s[f]=(c/h*.5+.5)*255,s[f+1]=(u/h*.5+.5)*255,s[f+2]=(1/h*.5+.5)*255,s[f+3]=255}return Ah(s,i,e)}function cp(i=256){let e=mn(11),t=[[6,12],[12,24],[24,48],[48,96]].map(([s,r])=>[new kt(s,s,e()*1e9|0),new kt(r,r,e()*1e9|0)]),n=new Uint8Array(i*i*4);for(let s=0;s<i;s++)for(let r=0;r<i;r++){let o=(r+.5)/i,a=(s+.5)/i,l=(s*i+r)*4;for(let c=0;c<4;c++)n[l+c]=Zi((t[c][0].at(o,a)+.35*t[c][1].at(o,a))/1.35)*255}return Ah(n,i,i,{aniso:4})}function up(i=256){let e=mn(77),t=[];for(;t.length<30;){let r=Math.round((e()*2-1)*9),o=Math.round((e()*2-1)*9),a=r*r+o*o;a<1||a>60||t.push([r,o,1/Math.pow(a,.75),e()*Math.PI*2])}let n=new Float32Array(i*i),s=0;for(let r of t)s+=r[2];for(let r=0;r<i;r++)for(let o=0;o<i;o++){let a=(o+.5)/i,l=(r+.5)/i,c=0;for(let[u,h,f,d]of t)c+=f*Math.sin(2*Math.PI*(u*a+h*l)+d);n[r*i+o]=c/s}return js(i,i,n,9)}var qo=(i,e,t,n,s)=>{n[s]=i[0]+(e[0]-i[0])*t,n[s+1]=i[1]+(e[1]-i[1])*t,n[s+2]=i[2]+(e[2]-i[2])*t},Rh=(i,e,t,n)=>{t[n]=i[0]*e,t[n+1]=i[1]*e,t[n+2]=i[2]*e};function hp(i=256){let e=mn(21),t=[new kt(4,4,e()*1e9|0),new kt(9,9,e()*1e9|0),new kt(18,18,e()*1e9|0)],n=new kt(40,13,e()*1e9|0),s=[new kt(48,48,e()*1e9|0),new kt(96,96,e()*1e9|0)],r=mn(5),o=new Float32Array(i*i),a=[0,0,0],l=[44,72,26],c=[84,122,40],u=[146,150,66];return{albedo:vc(i,i,(f,d,g,x,p)=>{let m=wh(f,d,t,[.5,.32,.18]),y=n.at(f,d),_=s[0].at(f,d)*.6+s[1].at(f,d)*.4,v=r();qo(l,c,Zi(y*1.5-.1+_*.5),a,0),qo(a,u,Zi((m-.45)*2.6),p,0),Rh(p,.86+.28*v,p,0),o[x*i+g]=y*.7+_*.3}),normal:js(i,i,o,1.7)}}function fp(i=256){let e=mn(33),t=new kt(6,6,e()*1e9|0),n=[new kt(40,40,e()*1e9|0),new kt(90,90,e()*1e9|0)],s=mn(9),r=new Float32Array(i*i),o=[228,206,166],a=[201,176,132];return{albedo:vc(i,i,(c,u,h,f,d)=>{let g=.5+.5*Math.sin(2*Math.PI*(u*5+1.1*t.at(c,u))),x=s(),p=n[0].at(c,u);qo(a,o,Zi(.35+.65*g+(p-.5)*.5),d,0),Rh(d,.9+.2*x,d,0),r[f*i+h]=g*.75+n[1].at(c,u)*.25}),normal:js(i,i,r,3.2)}}function dp(i=256){let e=mn(44),t=[new kt(4,4,e()*1e9|0),new kt(8,8,e()*1e9|0),new kt(16,16,e()*1e9|0),new kt(32,32,e()*1e9|0)],n=new kt(5,5,e()*1e9|0),s=new kt(7,7,e()*1e9|0),r=mn(3),o=new Float32Array(i*i),a=[138,128,114],l=[82,78,72],c=[86,96,56],u=[0,0,0];return{albedo:vc(i,i,(f,d,g,x,p)=>{let m=wh(f,d,t,[.46,.27,.17,.1]),y=1-Zi(Math.abs(n.at(f,d)-.5)/.035),_=r();qo(l,a,Zi((m-.25)*1.9),u,0),qo(u,c,Zi((s.at(f,d)-.58)*5)*.55,p,0),Rh(p,(.9+.2*_)*(1-.5*y*y),p,0),o[x*i+g]=m-.4*y}),normal:js(i,i,o,5)}}function pp(i=256){let e=mn(55),t=[new kt(24,24,e()*1e9|0),new kt(56,56,e()*1e9|0)],n=mn(8),s=new Float32Array(i*i);for(let r=0;r<i;r++)for(let o=0;o<i;o++)s[r*i+o]=wh((o+.5)/i,(r+.5)/i,t,[.45,.3])+n()*.35;return js(i,i,s,3.4)}function mp(i=192,e=6){let t=mn(165),n=new kt(96,96,t()*1e9|0),s=mn(14),r=Array.from({length:e*e*2},()=>(s()-.5)*16),o=mn(21),a=i/e,l=[156,152,144];return vc(i,i,(c,u,h,f,d)=>{let g=Math.floor(f/a),x=(h+g%2*a*.5)%i,p=Math.floor(x/a),m=x%a,y=f%a,_=Math.min(m,a-m,y,a-y),v=r[g*e+p]+(_<2.2?-26:0)+(n.at(c,u)-.5)*12+(o()-.5)*9;d[0]=l[0]+v,d[1]=l[1]+v,d[2]=l[2]+v*.92})}function gp(i=128,e=4){let t=mn(66),n=new kt(48,48,t()*1e9|0),s=mn(13),r=Array.from({length:72},()=>.86+s()*.14),o=new Float32Array(i*i),a=i/e;for(let l=0;l<i;l++)for(let c=0;c<i;c++){let u=Math.floor(l/a),h=(c+u%2*a*.5)%i,f=Math.floor(h/a),d=h%a,g=l%a,x=Math.min(d,a-d,g,a-g),p=Zi(x/3)*(1-.06*Math.pow(Math.min(d,a-d)/(a/2)-1,2)-.06*Math.pow(Math.min(g,a-g)/(a/2)-1,2));o[l*i+c]=p*r[(u*e+f)%72]+n.at((c+.5)/i,(l+.5)/i)*.06}return js(i,i,o,2.2)}function xp(i=256){let e=mn(88),t=new kt(64,96,e()*1e9|0),n=new Float32Array(i*i);for(let s=0;s<i;s++)for(let r=0;r<i;r++){let o=(r+.5)/i,a=(s+.5)/i,l=.11*Math.sin(2*Math.PI*o*4),c=Math.floor(a*8+l),u=Th(a*8+l);n[s*i+r]=Eh(Zi(u*1.6))*(.85+.15*(c%2))+t.at(o,a)*.1}return js(i,i,n,2)}function vp(i=256,e=5){let t=document.createElement("canvas");t.width=t.height=i;let n=t.getContext("2d"),s=mn(e),r=24;n.clearRect(0,0,i,i);for(let a=0;a<r;a++){let l=i*(.06+.88*s()),c=i*(.45+.55*s()),u=(s()-.5)*i*.6,h=i*(.009+.007*s()),f=l+u,d=i-c,g=l+u*.25,x=i-c*.55,p=10,m=[],y=[];for(let w=0;w<=p;w++){let S=w/p,E=1-S,A=E*E*l+2*E*S*g+S*S*f,b=E*E*i+2*E*S*x+S*S*d,M=2*E*(g-l)+2*S*(f-g),R=2*E*(x-i)+2*S*(d-x),L=Math.hypot(M,R)||1,U=h*(1-S)+.4;m.push([A-R/L*U,b+M/L*U]),y.push([A+R/L*U,b-M/L*U])}let _=n.createLinearGradient(0,i,0,d),v=s();_.addColorStop(0,`rgb(${34+v*16},${58+v*18},${20+v*8})`),_.addColorStop(1,`rgb(${108+v*50},${132+v*40},${48+v*22})`),n.fillStyle=_,n.beginPath(),n.moveTo(m[0][0],m[0][1]);for(let w of m)n.lineTo(w[0],w[1]);for(let w=y.length-1;w>=0;w--)n.lineTo(y[w][0],y[w][1]);n.closePath(),n.fill()}let o=new as(t);return o.colorSpace=Kt,o.anisotropy=4,o.generateMipmaps=!0,o.minFilter=Qn,o}function yp(i=64,e=256){let t=document.createElement("canvas");t.width=i,t.height=e;let n=t.getContext("2d");n.clearRect(0,0,i,e);let s=a=>i*.46*Math.pow(Math.sin(Math.PI*Math.pow(a,.75)),.8)*(1-.15*a);n.beginPath(),n.moveTo(i/2,e);for(let a=1;a<=24;a++){let l=a/24;n.lineTo(i/2+s(l),e*(1-l))}for(let a=24;a>=0;a--){let l=a/24;n.lineTo(i/2-s(l),e*(1-l))}n.closePath();let r=n.createLinearGradient(0,e,0,0);r.addColorStop(0,"#2d5620"),r.addColorStop(.55,"#4a8530"),r.addColorStop(1,"#7aa43c"),n.fillStyle=r,n.fill(),n.strokeStyle="rgba(28, 52, 20, 0.6)",n.lineWidth=2,n.beginPath(),n.moveTo(i/2,e),n.lineTo(i/2,4),n.stroke();let o=new as(t);return o.colorSpace=Kt,o.anisotropy=8,o.wrapS=o.wrapT=On,o.userData.alphaCard=!0,o}function g_(){let i=lt;i.fog_pars_vertex=`
#ifdef USE_FOG
  varying float vFogDepth;
  varying vec3 vFogWorld;
#endif`,i.fog_vertex=`
#ifdef USE_FOG
  vFogDepth = - mvPosition.z;
  vec4 fogWP = vec4( transformed, 1.0 );
  #ifdef USE_BATCHING
    fogWP = batchingMatrix * fogWP;
  #endif
  #ifdef USE_INSTANCING
    fogWP = instanceMatrix * fogWP;
  #endif
  vFogWorld = ( modelMatrix * fogWP ).xyz;
#endif`,i.fog_pars_fragment=`
#ifdef USE_FOG
  uniform vec3 fogColor;
  varying float vFogDepth;
  varying vec3 vFogWorld;
  #ifdef FOG_EXP2
    uniform float fogDensity;
  #else
    uniform float fogNear;
    uniform float fogFar;
  #endif
  #ifdef USE_FOG_SUN
    uniform vec3 uFogSunDir, uFogSunColor;
    uniform float uFogMist;
  #endif
#endif`,i.fog_fragment=`
#ifdef USE_FOG
  float fogD = fogDensity;
  #ifdef USE_FOG_SUN
    fogD *= 1.0 + uFogMist * exp( - max( vFogWorld.y, 0.0 ) / 7.0 );     // \u8D34\u5730\u96FE\uFF1A\u6E05\u6668\u6D77\u9762\u4E0A\u7684\u4E00\u5C42\u8584\u96FE
  #endif
  #ifdef FOG_EXP2
    float fogFactor = 1.0 - exp( - fogD * fogD * vFogDepth * vFogDepth );
  #else
    float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
  #endif
  vec3 fogCol = fogColor;
  #ifdef USE_FOG_SUN
    vec3 fogV = vFogWorld - cameraPosition;
    fogV.y = 0.0;
    float fogA = pow( max( dot( normalize( fogV ), uFogSunDir ), 0.0 ), 5.0 );   // \u671D\u9633\u65B9\u5411\u7684\u96FE\u66F4\u4EAE\u66F4\u6696
    fogCol = mix( fogColor, uFogSunColor, fogA );
  #endif
  gl_FragColor.rgb = mix( gl_FragColor.rgb, fogCol, fogFactor );
#endif`}function x_(){let i=lt;if(i.lights_physical_fragment.includes("USE_PBR_BATCH"))return;let e=(t,n)=>`#ifdef USE_PBR_BATCH
	material.${t} = ${n};
#else
	material.${t} = ${t};
#endif`;i.lights_physical_fragment=vs(vs(i.lights_physical_fragment,"material.clearcoat = clearcoat;",e("clearcoat","clearcoat * vPBR.w")),"material.sheenColor = sheenColor;",e("sheenColor","sheenColor * vSheen"))}var _p=`
  if ( aSway.x > 0.0 ) {
    float swPh = uTime * 1.25 + aSway.y + position.x * 0.07 + position.z * 0.05;
    float swG = sin( swPh ) * 0.6 + sin( swPh * 2.17 + 1.3 ) * 0.4;
    transformed += uWindDir * ( swG * 0.55 + 0.35 ) * aSway.x * uWindStrength * 0.5;
    transformed.y -= abs( swG ) * aSway.x * uWindStrength * 0.12;
  }
`,v_=`
  uniform float uTime;
  uniform vec3 uWindDir;
  uniform float uWindStrength;
  attribute vec4 aPBR;
  attribute vec4 aMat;
  attribute vec2 aSway;
  varying vec4 vPBR;
  varying float vLamp;
  varying vec3 vWPosP;
`,y_=`
  uniform vec3 uSunRadiance, uSunDirW, uLampColorL;
  uniform float uLampEmissive, uDetailFade;
  uniform sampler2D tNoise;
  varying vec4 vPBR;
  varying float vLamp;
  varying vec3 vWPosP;
`,__=`
  float detP = exp( - length( vViewPosition ) * uDetailFade );          // \u7EC6\u8282\u968F\u8DDD\u79BB\u6DE1\u51FA\uFF0C\u8FDC\u5904\u4E0D\u95EA
  if ( vPBR.z > 0.5 && vPBR.z < 1.5 ) {                                   // \u6811\u51A0\uFF1A\u8F6E\u5ED3\u5904\u6309\u566A\u58F0\u4FB5\u8680\u51FA\u53F6\u7F18
    float ndvP = abs( dot( normal, normalize( vViewPosition ) ) );
    float er = texture2D( tNoise, vWPosP.xz * 0.9 + vWPosP.y * 0.31 ).g;
    if ( er < 0.455 - 0.14 * ( 1.0 - detP ) && ndvP < 0.72 ) discard;
  }
  if ( vPBR.z > 0.5 && vPBR.z < 2.5 ) {                                   // \u6811\u51A0 / \u53F6\u7247\uFF1A\u4E16\u754C\u7A7A\u95F4\u566A\u58F0\u51F9\u51F8\uFF0C\u6253\u6563\u5149\u6ED1\u7403\u9762
    float bh = texture2D( tNoise, vWPosP.xz * 3.1 + vWPosP.y * 2.3 ).b + texture2D( tNoise, vWPosP.zy * 7.3 + vWPosP.x * 5.1 ).a * 0.5;
    vec3 dpdx = dFdx( - vViewPosition ), dpdy = dFdy( - vViewPosition );
    vec3 r1 = cross( dpdy, normal ), r2 = cross( normal, dpdx );
    float det = dot( dpdx, r1 );
    normal = normalize( abs( det ) * normal - sign( det ) * ( dFdx( bh ) * r1 + dFdy( bh ) * r2 ) * 2.6 * ( 0.35 + 0.65 * detP ) );
  }
`,M_=`
  if ( vPBR.z > 0.5 ) {                                                   // \u53F6 / \u6811\u51A0 / \u7FBD\u6BDB\uFF1A\u4E24\u4E2A\u5C3A\u5EA6\u7684\u566A\u58F0\u628A\u7EAF\u8272\u6253\u6563
    float cn = texture2D( tNoise, vWPosP.xz * 0.35 + vWPosP.y * 0.21 ).r;
    float cn2 = texture2D( tNoise, vWPosP.xz * 2.6 + vWPosP.y * 1.9 ).g;
    diffuseColor.rgb *= mix( 0.66, 1.3, cn ) * mix( 0.78, 1.24, cn2 );
  }
  if ( vPBR.z > 0.5 && vPBR.z < 2.5 ) diffuseColor.rgb *= vec3( 0.5, 0.58, 0.45 );   // \u53F6 / \u6811\u51A0\uFF1A\u8D5B\u7490\u7490\u7684\u9C9C\u7EFF\u538B\u6210\u81EA\u7136\u7684\u53F6\u7EFF
  else if ( vPBR.z > 2.5 && vPBR.z < 3.5 ) diffuseColor.rgb *= vec3( 0.76, 0.74, 0.70 );   // \u7FBD\u6BDB\uFF1A\u5976\u6CB9\u767D
  else if ( vPBR.z > 3.5 ) diffuseColor.rgb *= 0.74;                             // \u767D\u6F06 / \u767D\u5851\u6599
`,S_=`
  if ( vPBR.z > 1.5 && vPBR.z < 2.5 ) {                                   // \u53F6\u7247\u80CC\u5149\u900F\u5149
    vec3 sunV = normalize( ( viewMatrix * vec4( uSunDirW, 0.0 ) ).xyz );
    float back = pow( max( dot( - normal, sunV ), 0.0 ), 1.2 );
    reflectedLight.directDiffuse += diffuseColor.rgb * uSunRadiance * RECIPROCAL_PI * back * 0.5;
  }
`,vs=(i,e,t)=>{if(!i.includes(e))throw new Error("\u7740\u8272\u5668\u8865\u4E01\u627E\u4E0D\u5230\u951A\u70B9: "+e);return i.replace(e,t)};function b_(i,e){Object.assign(i.uniforms,e),i.vertexShader=vs(vs(i.vertexShader,"#include <common>",`#include <common>
`+v_),"#include <begin_vertex>",`#include <begin_vertex>
`+_p+`
  vPBR = aPBR; vLamp = aMat.z;
  vWPosP = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;`),i.fragmentShader=vs(i.fragmentShader,"#include <common>",`#include <common>
`+y_);for(let[t,n]of[["#include <color_fragment>",M_],["#include <roughnessmap_fragment>","  roughnessFactor = clamp( vPBR.x, 0.05, 1.0 );"],["#include <metalnessmap_fragment>","  metalnessFactor = vPBR.y;"],["#include <normal_fragment_maps>",__],["#include <emissivemap_fragment>","  totalEmissiveRadiance += vColor * uLampColorL * ( uLampEmissive * vLamp );"],["#include <lights_physical_fragment>",`  float vSheen = ( vPBR.z > 2.5 && vPBR.z < 3.5 ) ? 1.0 : 0.0;
  #include <lights_physical_fragment>`],["#include <lights_fragment_end>",S_]])i.fragmentShader=vs(i.fragmentShader,t,n.startsWith("  float")?n:t+`
`+n)}function E_(i,e){Object.assign(i.uniforms,e)}function T_(i,e){i.uniforms.uTime=e.uTime,i.uniforms.uWindDir=e.uWindDir,i.uniforms.uWindStrength=e.uWindStrength,i.vertexShader=vs(vs(i.vertexShader,"#include <common>",`#include <common>
  uniform float uTime; uniform vec3 uWindDir; uniform float uWindStrength; attribute vec2 aSway;`),"#include <begin_vertex>",`#include <begin_vertex>
`+_p)}var w_=new we(1,1,1),A_=new D,R_=new we;function Mp(i,e,t={}){let{renderer:n,scene:s}=i,r={noise:cp(),featherN:xp()},o=lp(n),a={uTime:e.uTime,uWindDir:e.uWindDir,uWindStrength:e.uWindStrength,uLampColorL:{value:new we(1,.64,.32)},uLampEmissive:{value:0},uSunRadiance:{value:new we(0,0,0)},uSunDirW:{value:new D(0,1,0)},uDetailFade:{value:.045},uFogSunDir:{value:new D(0,0,-1)},uFogSunColor:{value:new we},uFogMist:{value:0}};g_(),x_();let l=new fo(0,7e-4),c=[],u=[],h=new Set,f=new Map,d=new we(1,.66,.36),g=new Io(16769976,0,36,.42,.6,2),x=[0,1].map(()=>new zs(d,0,24,2)),p=new zs(d,0,80,2),m=(t.world?.pier.lamps??[]).map(A=>{let b=new zs(d,0,18,2);return b.position.copy(A),b}),y=[g,...x,p,...m];for(let A of y)A.visible=!1,A.castShadow=!1,s.add(A);s.add(g.target);function _(A,b){let M=b.uniforms.uMap.value??null,R=!!A.userData.alphaCard,L=(M?M.uuid:"plain")+(R?"+card":""),U=f.get(L);if(!U){U=new Tr({color:16777215,vertexColors:!0,map:M,alphaTest:R?.42:0,side:R?Wt:xn,roughness:.8,metalness:0,clearcoat:1,clearcoatRoughness:.06,sheen:1,sheenRoughness:.5,sheenColor:new we(1,1,1)}),U.defines={USE_FOG_SUN:"",USE_PBR_BATCH:""},U.onBeforeCompile=X=>b_(X,a),U.customProgramCacheKey=()=>"pelican-batch"+(R?"-card":""),U.userData.batch=!0,U.name="pbr-batch",f.set(L,U);let V=new cs({depthPacking:Cr,map:R?M:null,alphaTest:R?.42:0});V.onBeforeCompile=X=>T_(X,a),V.customProgramCacheKey=()=>"pelican-sway-depth",U.userData.depth=V}return A.customDepthMaterial=U.userData.depth,U}function v(A,b){if(A.userData.pbrSibling!==void 0)return A.userData.pbrSibling;let M=null;if(A.userData.pbrOverride)M=A.userData.pbrOverride;else{let R=A.userData.src??{},L=ac(R.color,R);if(L){let U=A.uniforms;M=new Tr({color:16777215,vertexColors:A.vertexColors,map:U.uMap.value??null,side:A.side,transparent:A.transparent,opacity:1,depthWrite:A.depthWrite,roughness:L.rough,metalness:L.metal,clearcoat:L.clearcoat,clearcoatRoughness:.07,sheen:L.sheen,sheenRoughness:.55,sheenColor:new we(1,1,1),normalMap:L.normal==="feather"?r.featherN:null,normalScale:new be(.9,.9),normalMapType:Pr,emissive:new we(16777215),emissiveIntensity:0,fog:!0}),L.normal==="feather"&&M.normalMap.repeat.set(3,2),M.defines={USE_FOG_SUN:""},M.onBeforeCompile=V=>E_(V,a),M.customProgramCacheKey=()=>"pelican-std",M.name="pbr-std:"+L.name,M.userData.toonSrc=A,M.userData.cls=L,h.add(M),M.addEventListener("dispose",()=>h.delete(M))}}return A.userData.pbrSibling=M,M}let w={},S={},E={real:!1,look:null,renderer:n,postHide:[],K:{tex:r,uni:a,sky:o,fog:l,live:h},onLook:c,onStyle:u,lights:{head:g,lamps:x,lantern:p,pier:m},adopt(A){A.traverse(b=>{if(b.userData.isOutline){b.visible=!E.real;return}b.userData.realOnly?b.visible=E.real:b.userData.toonOnly&&(b.visible=!E.real);let M=b.userData.toonMat||(b.isMesh&&b.material?.userData?.isToon?b.material:null);if(!M)return;b.userData.toonMat=M;let R=b.geometry.getAttribute("aMat")?_(b,M):v(M,b);b.material=E.real&&R?R:M,E.real&&!R?(b.userData.hiddenByReal=!0,b.visible=!1):b.userData.hiddenByReal&&(b.userData.hiddenByReal=!1,b.visible=!0)}),E.syncColors()},set(A){E.real=!!A,e.uMode.value=E.real?1:0,E.adopt(s),n.toneMapping=E.real?Ar:jn,n.outputColorSpace=E.real?Kt:_i,s.fog=E.real?l:null,s.environment=E.real?o.envMap:null;for(let b of y)b.visible=E.real;for(let b of u)b(E.real)},syncColors(){for(let A of h){let b=A.userData.toonSrc.uniforms;A.color.copy(b.uColor.value).multiply(R_.setRGB(...A.userData.cls.tint)),A.emissive.copy(b.uEmissive.value),A.emissiveIntensity=b.uEmissiveLevel.value*A.userData.cls.emissive,A.opacity=b.uOpacity.value,A.sheen>0&&A.sheenColor.copy(A.color).lerp(w_,.6)}},applyLook(A,b){let M=ip(A.hour,w),R=t.world?t.world.sky.uniforms.uMoonDir.value:A_.set(0,1,0),L=ap(o.lut,M,A.sunAz,[R.x,R.y,R.z],S);if(L.exposure=M.exposure,L.cloud=M.cloud,L.mist=M.mist,L.turbidity=M.turbidity,E.look=L,!E.real)return L;let U=o.update(L.sunDir,M.turbidity,L.night);(U.changed||!s.environment)&&(s.environment=U.envMap);let V=L.isMoon,X=V?L.moonDir:L.sunDir,$=i.sun;$.color.setRGB(...V?Br:L.sunT),$.intensity=V?L.moonE:L.sunE,$.position.set(b.x+X[0]*90,b.y+X[1]*90,b.z+X[2]*90),$.target.position.copy(b),$.target.updateMatrixWorld(),$.castShadow=i.shadowEnabled&&$.intensity>.02,a.uSunRadiance.value.setRGB(...L.sunT).multiplyScalar(L.sunE),a.uSunDirW.value.set(L.sunDir[0],L.sunDir[1],L.sunDir[2]),l.color.setRGB(...L.fog),l.density=M.fog,a.uFogSunColor.value.setRGB(...L.fogSun),a.uFogSunDir.value.set(Math.sin(A.sunAz*ni),0,Math.cos(A.sunAz*ni)),a.uFogMist.value=M.mist,n.toneMappingExposure=M.exposure,e.uBeamK.value=1.6/M.exposure;for(let K of c)K(L);return L},update(A){if(!E.real)return;let b=A.lampLevel??0,M=(A.quality??2)===0;a.uLampEmissive.value=b*6;let R=A.head;g.intensity=R&&R.on?30*R.level:0,R&&(g.position.copy(R.pos),g.target.position.copy(R.pos).addScaledVector(R.dir,6),g.target.updateMatrixWorld());let L=A.world?.lightsOut;for(let U=0;U<2;U++){let V=L?.[1+U];if(!V)break;x[U].position.copy(V.pos),x[U].intensity=V.range>0?9*b:0}L&&p.position.copy(L[0].pos),p.intensity=M?0:b*150;for(let U of m)U.intensity=M?0:b*5;E.syncColors()}};return E}var Pi={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};var kr=class extends yn{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof dt?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=Cn.clone(e.uniforms),this.material=new dt({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new Hn(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var Yo=class extends yn{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){let s=e.getContext(),r=e.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let o,a;this.inverse?(o=0,a=1):(o=1,a=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),r.buffers.stencil.setFunc(s.ALWAYS,o,4294967295),r.buffers.stencil.setClear(a),r.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(s.EQUAL,1,4294967295),r.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),r.buffers.stencil.setLocked(!0)}},yc=class extends yn{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}};var _c=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let n=e.getSize(new be);this._width=n.width,this._height=n.height,t=new Lt(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:$t}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new kr(Pi),this.copyPass.material.blending=tn,this.clock=new Lo}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());let t=this.renderer.getRenderTarget(),n=!1;for(let s=0,r=this.passes.length;s<r;s++){let o=this.passes[s];if(o.enabled!==!1){if(o.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),o.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),o.needsSwap){if(n){let a=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(a.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(a.EQUAL,1,4294967295)}this.swapBuffers()}Yo!==void 0&&(o instanceof Yo?n=!0:o instanceof yc&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new be);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let n=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(n,s),this.renderTarget2.setSize(n,s);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(n,s)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var Mc=class extends yn{constructor(e,t,n=null,s=null,r=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=s,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new we}render(e,t,n){let s=e.autoClear;e.autoClear=!1;let r,o;this.overrideMaterial!==null&&(o=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(r=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=o),e.autoClear=s}};var Zo={name:"GTAOShader",defines:{PERSPECTIVE_CAMERA:1,SAMPLES:16,NORMAL_VECTOR_TYPE:1,DEPTH_SWIZZLING:"x",SCREEN_SPACE_RADIUS:0,SCREEN_SPACE_RADIUS_SCALE:100,SCENE_CLIP_BOX:0},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new be},cameraNear:{value:null},cameraFar:{value:null},cameraProjectionMatrix:{value:new qe},cameraProjectionMatrixInverse:{value:new qe},cameraWorldMatrix:{value:new qe},radius:{value:.25},distanceExponent:{value:1},thickness:{value:1},distanceFallOff:{value:1},scale:{value:1},sceneBoxMin:{value:new D(-1,-1,-1)},sceneBoxMax:{value:new D(1,1,1)}},vertexShader:`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		varying vec2 vUv;
		uniform highp sampler2D tNormal;
		uniform highp sampler2D tDepth;
		uniform sampler2D tNoise;
		uniform vec2 resolution;
		uniform float cameraNear;
		uniform float cameraFar;
		uniform mat4 cameraProjectionMatrix;
		uniform mat4 cameraProjectionMatrixInverse;
		uniform mat4 cameraWorldMatrix;
		uniform float radius;
		uniform float distanceExponent;
		uniform float thickness;
		uniform float distanceFallOff;
		uniform float scale;
		#if SCENE_CLIP_BOX == 1
			uniform vec3 sceneBoxMin;
			uniform vec3 sceneBoxMax;
		#endif

		#include <common>
		#include <packing>

		#ifndef FRAGMENT_OUTPUT
		#define FRAGMENT_OUTPUT vec4(vec3(ao), 1.)
		#endif

		vec3 getViewPosition(const in vec2 screenPosition, const in float depth) {
			vec4 clipSpacePosition = vec4(vec3(screenPosition, depth) * 2.0 - 1.0, 1.0);
			vec4 viewSpacePosition = cameraProjectionMatrixInverse * clipSpacePosition;
			return viewSpacePosition.xyz / viewSpacePosition.w;
		}

		float getDepth(const vec2 uv) {
			return textureLod(tDepth, uv.xy, 0.0).DEPTH_SWIZZLING;
		}

		float fetchDepth(const ivec2 uv) {
			return texelFetch(tDepth, uv.xy, 0).DEPTH_SWIZZLING;
		}

		float getViewZ(const in float depth) {
			#if PERSPECTIVE_CAMERA == 1
				return perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
			#else
				return orthographicDepthToViewZ(depth, cameraNear, cameraFar);
			#endif
		}

		vec3 computeNormalFromDepth(const vec2 uv) {
			vec2 size = vec2(textureSize(tDepth, 0));
			ivec2 p = ivec2(uv * size);
			float c0 = fetchDepth(p);
			float l2 = fetchDepth(p - ivec2(2, 0));
			float l1 = fetchDepth(p - ivec2(1, 0));
			float r1 = fetchDepth(p + ivec2(1, 0));
			float r2 = fetchDepth(p + ivec2(2, 0));
			float b2 = fetchDepth(p - ivec2(0, 2));
			float b1 = fetchDepth(p - ivec2(0, 1));
			float t1 = fetchDepth(p + ivec2(0, 1));
			float t2 = fetchDepth(p + ivec2(0, 2));
			float dl = abs((2.0 * l1 - l2) - c0);
			float dr = abs((2.0 * r1 - r2) - c0);
			float db = abs((2.0 * b1 - b2) - c0);
			float dt = abs((2.0 * t1 - t2) - c0);
			vec3 ce = getViewPosition(uv, c0).xyz;
			vec3 dpdx = (dl < dr) ? ce - getViewPosition((uv - vec2(1.0 / size.x, 0.0)), l1).xyz : -ce + getViewPosition((uv + vec2(1.0 / size.x, 0.0)), r1).xyz;
			vec3 dpdy = (db < dt) ? ce - getViewPosition((uv - vec2(0.0, 1.0 / size.y)), b1).xyz : -ce + getViewPosition((uv + vec2(0.0, 1.0 / size.y)), t1).xyz;
			return normalize(cross(dpdx, dpdy));
		}

		vec3 getViewNormal(const vec2 uv) {
			#if NORMAL_VECTOR_TYPE == 2
				return normalize(textureLod(tNormal, uv, 0.).rgb);
			#elif NORMAL_VECTOR_TYPE == 1
				return unpackRGBToNormal(textureLod(tNormal, uv, 0.).rgb);
			#else
				return computeNormalFromDepth(uv);
			#endif
		}

		vec3 getSceneUvAndDepth(vec3 sampleViewPos) {
			vec4 sampleClipPos = cameraProjectionMatrix * vec4(sampleViewPos, 1.);
			vec2 sampleUv = sampleClipPos.xy / sampleClipPos.w * 0.5 + 0.5;
			float sampleSceneDepth = getDepth(sampleUv);
			return vec3(sampleUv, sampleSceneDepth);
		}

		void main() {
			float depth = getDepth(vUv.xy);
			if (depth >= 1.0) {
				discard;
				return;
			}
			vec3 viewPos = getViewPosition(vUv, depth);
			vec3 viewNormal = getViewNormal(vUv);

			float radiusToUse = radius;
			float distanceFalloffToUse = thickness;
			#if SCREEN_SPACE_RADIUS == 1
				float radiusScale = getViewPosition(vec2(0.5 + float(SCREEN_SPACE_RADIUS_SCALE) / resolution.x, 0.0), depth).x;
				radiusToUse *= radiusScale;
				distanceFalloffToUse *= radiusScale;
			#endif

			#if SCENE_CLIP_BOX == 1
				vec3 worldPos = (cameraWorldMatrix * vec4(viewPos, 1.0)).xyz;
				float boxDistance = length(max(vec3(0.0), max(sceneBoxMin - worldPos, worldPos - sceneBoxMax)));
				if (boxDistance > radiusToUse) {
					discard;
					return;
				}
			#endif

			vec2 noiseResolution = vec2(textureSize(tNoise, 0));
			vec2 noiseUv = vUv * resolution / noiseResolution;
			vec4 noiseTexel = textureLod(tNoise, noiseUv, 0.0);
			vec3 randomVec = noiseTexel.xyz * 2.0 - 1.0;
			vec3 tangent = normalize(vec3(randomVec.xy, 0.));
			vec3 bitangent = vec3(-tangent.y, tangent.x, 0.);
			mat3 kernelMatrix = mat3(tangent, bitangent, vec3(0., 0., 1.));

			const int DIRECTIONS = SAMPLES < 30 ? 3 : 5;
			const int STEPS = (SAMPLES + DIRECTIONS - 1) / DIRECTIONS;
			float ao = 0.0;
			for (int i = 0; i < DIRECTIONS; ++i) {

				float angle = float(i) / float(DIRECTIONS) * PI;
				vec4 sampleDir = vec4(cos(angle), sin(angle), 0., 0.5 + 0.5 * noiseTexel.w);
				sampleDir.xyz = normalize(kernelMatrix * sampleDir.xyz);

				vec3 viewDir = normalize(-viewPos.xyz);
				vec3 sliceBitangent = normalize(cross(sampleDir.xyz, viewDir));
				vec3 sliceTangent = cross(sliceBitangent, viewDir);
				vec3 normalInSlice = normalize(viewNormal - sliceBitangent * dot(viewNormal, sliceBitangent));

				vec3 tangentToNormalInSlice = cross(normalInSlice, sliceBitangent);
				vec2 cosHorizons = vec2(dot(viewDir, tangentToNormalInSlice), dot(viewDir, -tangentToNormalInSlice));

				for (int j = 0; j < STEPS; ++j) {
					vec3 sampleViewOffset = sampleDir.xyz * radiusToUse * sampleDir.w * pow(float(j + 1) / float(STEPS), distanceExponent);

					vec3 sampleSceneUvDepth = getSceneUvAndDepth(viewPos + sampleViewOffset);
					vec3 sampleSceneViewPos = getViewPosition(sampleSceneUvDepth.xy, sampleSceneUvDepth.z);
					vec3 viewDelta = sampleSceneViewPos - viewPos;
					if (abs(viewDelta.z) < thickness) {
						float sampleCosHorizon = dot(viewDir, normalize(viewDelta));
						cosHorizons.x += max(0., (sampleCosHorizon - cosHorizons.x) * mix(1., 2. / float(j + 2), distanceFallOff));
					}

					sampleSceneUvDepth = getSceneUvAndDepth(viewPos - sampleViewOffset);
					sampleSceneViewPos = getViewPosition(sampleSceneUvDepth.xy, sampleSceneUvDepth.z);
					viewDelta = sampleSceneViewPos - viewPos;
					if (abs(viewDelta.z) < thickness) {
						float sampleCosHorizon = dot(viewDir, normalize(viewDelta));
						cosHorizons.y += max(0., (sampleCosHorizon - cosHorizons.y) * mix(1., 2. / float(j + 2), distanceFallOff));
					}
				}

				vec2 sinHorizons = sqrt(1. - cosHorizons * cosHorizons);
				float nx = dot(normalInSlice, sliceTangent);
				float ny = dot(normalInSlice, viewDir);
				float nxb = 1. / 2. * (acos(cosHorizons.y) - acos(cosHorizons.x) + sinHorizons.x * cosHorizons.x - sinHorizons.y * cosHorizons.y);
				float nyb = 1. / 2. * (2. - cosHorizons.x * cosHorizons.x - cosHorizons.y * cosHorizons.y);
				float occlusion = nx * nxb + ny * nyb;
				ao += occlusion;
			}

			ao = clamp(ao / float(DIRECTIONS), 0., 1.);
		#if SCENE_CLIP_BOX == 1
			ao = mix(ao, 1., smoothstep(0., radiusToUse, boxDistance));
		#endif
			ao = pow(ao, scale);

			gl_FragColor = FRAGMENT_OUTPUT;
		}`},Ko={name:"GTAODepthShader",defines:{PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},cameraNear:{value:null},cameraFar:{value:null}},vertexShader:`
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		uniform sampler2D tDepth;
		uniform float cameraNear;
		uniform float cameraFar;
		varying vec2 vUv;

		#include <packing>

		float getLinearDepth( const in vec2 screenPosition ) {
			#if PERSPECTIVE_CAMERA == 1
				float fragCoordZ = texture2D( tDepth, screenPosition ).x;
				float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
				return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
			#else
				return texture2D( tDepth, screenPosition ).x;
			#endif
		}

		void main() {
			float depth = getLinearDepth( vUv );
			gl_FragColor = vec4( vec3( 1.0 - depth ), 1.0 );

		}`},Sc={name:"GTAOBlendShader",uniforms:{tDiffuse:{value:null},intensity:{value:1}},vertexShader:`
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		uniform float intensity;
		uniform sampler2D tDiffuse;
		varying vec2 vUv;

		void main() {
			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = vec4(mix(vec3(1.), texel.rgb, intensity), texel.a);
		}`};function Sp(i=5){let e=Math.floor(i)%2===0?Math.floor(i)+1:Math.floor(i),t=C_(e),n=t.length,s=new Uint8Array(n*4);for(let o=0;o<n;++o){let a=t[o],l=2*Math.PI*a/n,c=new D(Math.cos(l),Math.sin(l),0).normalize();s[o*4]=(c.x*.5+.5)*255,s[o*4+1]=(c.y*.5+.5)*255,s[o*4+2]=127,s[o*4+3]=255}let r=new ui(s,e,e);return r.wrapS=bn,r.wrapT=bn,r.needsUpdate=!0,r}function C_(i){let e=Math.floor(i)%2===0?Math.floor(i)+1:Math.floor(i),t=e*e,n=Array(t).fill(0),s=Math.floor(e/2),r=e-1;for(let o=1;o<=t;){if(s===-1&&r===e?(r=e-2,s=0):(r===e&&(r=0),s<0&&(s=e-1)),n[s*e+r]!==0){r-=2,s++;continue}else n[s*e+r]=o++;r++,s--}return n}var $o={name:"PoissonDenoiseShader",defines:{SAMPLES:16,SAMPLE_VECTORS:Ch(16,2,1),NORMAL_VECTOR_TYPE:1,DEPTH_VALUE_SOURCE:0},uniforms:{tDiffuse:{value:null},tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new be},cameraProjectionMatrixInverse:{value:new qe},lumaPhi:{value:5},depthPhi:{value:5},normalPhi:{value:5},radius:{value:4},index:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`

		varying vec2 vUv;

		uniform sampler2D tDiffuse;
		uniform sampler2D tNormal;
		uniform sampler2D tDepth;
		uniform sampler2D tNoise;
		uniform vec2 resolution;
		uniform mat4 cameraProjectionMatrixInverse;
		uniform float lumaPhi;
		uniform float depthPhi;
		uniform float normalPhi;
		uniform float radius;
		uniform int index;

		#include <common>
		#include <packing>

		#ifndef SAMPLE_LUMINANCE
		#define SAMPLE_LUMINANCE dot(vec3(0.2125, 0.7154, 0.0721), a)
		#endif

		#ifndef FRAGMENT_OUTPUT
		#define FRAGMENT_OUTPUT vec4(denoised, 1.)
		#endif

		float getLuminance(const in vec3 a) {
			return SAMPLE_LUMINANCE;
		}

		const vec3 poissonDisk[SAMPLES] = SAMPLE_VECTORS;

		vec3 getViewPosition(const in vec2 screenPosition, const in float depth) {
			vec4 clipSpacePosition = vec4(vec3(screenPosition, depth) * 2.0 - 1.0, 1.0);
			vec4 viewSpacePosition = cameraProjectionMatrixInverse * clipSpacePosition;
			return viewSpacePosition.xyz / viewSpacePosition.w;
		}

		float getDepth(const vec2 uv) {
		#if DEPTH_VALUE_SOURCE == 1
			return textureLod(tDepth, uv.xy, 0.0).a;
		#else
			return textureLod(tDepth, uv.xy, 0.0).r;
		#endif
		}

		float fetchDepth(const ivec2 uv) {
			#if DEPTH_VALUE_SOURCE == 1
				return texelFetch(tDepth, uv.xy, 0).a;
			#else
				return texelFetch(tDepth, uv.xy, 0).r;
			#endif
		}

		vec3 computeNormalFromDepth(const vec2 uv) {
			vec2 size = vec2(textureSize(tDepth, 0));
			ivec2 p = ivec2(uv * size);
			float c0 = fetchDepth(p);
			float l2 = fetchDepth(p - ivec2(2, 0));
			float l1 = fetchDepth(p - ivec2(1, 0));
			float r1 = fetchDepth(p + ivec2(1, 0));
			float r2 = fetchDepth(p + ivec2(2, 0));
			float b2 = fetchDepth(p - ivec2(0, 2));
			float b1 = fetchDepth(p - ivec2(0, 1));
			float t1 = fetchDepth(p + ivec2(0, 1));
			float t2 = fetchDepth(p + ivec2(0, 2));
			float dl = abs((2.0 * l1 - l2) - c0);
			float dr = abs((2.0 * r1 - r2) - c0);
			float db = abs((2.0 * b1 - b2) - c0);
			float dt = abs((2.0 * t1 - t2) - c0);
			vec3 ce = getViewPosition(uv, c0).xyz;
			vec3 dpdx = (dl < dr) ?  ce - getViewPosition((uv - vec2(1.0 / size.x, 0.0)), l1).xyz
									: -ce + getViewPosition((uv + vec2(1.0 / size.x, 0.0)), r1).xyz;
			vec3 dpdy = (db < dt) ?  ce - getViewPosition((uv - vec2(0.0, 1.0 / size.y)), b1).xyz
									: -ce + getViewPosition((uv + vec2(0.0, 1.0 / size.y)), t1).xyz;
			return normalize(cross(dpdx, dpdy));
		}

		vec3 getViewNormal(const vec2 uv) {
		#if NORMAL_VECTOR_TYPE == 2
			return normalize(textureLod(tNormal, uv, 0.).rgb);
		#elif NORMAL_VECTOR_TYPE == 1
			return unpackRGBToNormal(textureLod(tNormal, uv, 0.).rgb);
		#else
			return computeNormalFromDepth(uv);
		#endif
		}

		void denoiseSample(in vec3 center, in vec3 viewNormal, in vec3 viewPos, in vec2 sampleUv, inout vec3 denoised, inout float totalWeight) {
			vec4 sampleTexel = textureLod(tDiffuse, sampleUv, 0.0);
			float sampleDepth = getDepth(sampleUv);
			vec3 sampleNormal = getViewNormal(sampleUv);
			vec3 neighborColor = sampleTexel.rgb;
			vec3 viewPosSample = getViewPosition(sampleUv, sampleDepth);

			float normalDiff = dot(viewNormal, sampleNormal);
			float normalSimilarity = pow(max(normalDiff, 0.), normalPhi);
			float lumaDiff = abs(getLuminance(neighborColor) - getLuminance(center));
			float lumaSimilarity = max(1.0 - lumaDiff / lumaPhi, 0.0);
			float depthDiff = abs(dot(viewPos - viewPosSample, viewNormal));
			float depthSimilarity = max(1. - depthDiff / depthPhi, 0.);
			float w = lumaSimilarity * depthSimilarity * normalSimilarity;

			denoised += w * neighborColor;
			totalWeight += w;
		}

		void main() {
			float depth = getDepth(vUv.xy);
			vec3 viewNormal = getViewNormal(vUv);
			if (depth == 1. || dot(viewNormal, viewNormal) == 0.) {
				discard;
				return;
			}
			vec4 texel = textureLod(tDiffuse, vUv, 0.0);
			vec3 center = texel.rgb;
			vec3 viewPos = getViewPosition(vUv, depth);

			vec2 noiseResolution = vec2(textureSize(tNoise, 0));
			vec2 noiseUv = vUv * resolution / noiseResolution;
			vec4 noiseTexel = textureLod(tNoise, noiseUv, 0.0);
      		vec2 noiseVec = vec2(sin(noiseTexel[index % 4] * 2. * PI), cos(noiseTexel[index % 4] * 2. * PI));
    		mat2 rotationMatrix = mat2(noiseVec.x, -noiseVec.y, noiseVec.x, noiseVec.y);

			float totalWeight = 1.0;
			vec3 denoised = texel.rgb;
			for (int i = 0; i < SAMPLES; i++) {
				vec3 sampleDir = poissonDisk[i];
				vec2 offset = rotationMatrix * (sampleDir.xy * (1. + sampleDir.z * (radius - 1.)) / resolution);
				vec2 sampleUv = vUv + offset;
				denoiseSample(center, viewNormal, viewPos, sampleUv, denoised, totalWeight);
			}

			if (totalWeight > 0.) {
				denoised /= totalWeight;
			}
			gl_FragColor = FRAGMENT_OUTPUT;
		}`};function Ch(i,e,t){let n=P_(i,e,t),s="vec3[SAMPLES](";for(let r=0;r<i;r++){let o=n[r];s+=`vec3(${o.x}, ${o.y}, ${o.z})${r<i-1?",":")"}`}return s}function P_(i,e,t){let n=[];for(let s=0;s<i;s++){let r=2*Math.PI*e*s/i,o=Math.pow(s/(i-1),t);n.push(new D(Math.cos(r),Math.sin(r),o))}return n}var bc=class{constructor(e=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let t=0;t<256;t++)this.p[t]=Math.floor(e.random()*256);this.perm=[];for(let t=0;t<512;t++)this.perm[t]=this.p[t&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}noise(e,t){let n,s,r,o=.5*(Math.sqrt(3)-1),a=(e+t)*o,l=Math.floor(e+a),c=Math.floor(t+a),u=(3-Math.sqrt(3))/6,h=(l+c)*u,f=l-h,d=c-h,g=e-f,x=t-d,p,m;g>x?(p=1,m=0):(p=0,m=1);let y=g-p+u,_=x-m+u,v=g-1+2*u,w=x-1+2*u,S=l&255,E=c&255,A=this.perm[S+this.perm[E]]%12,b=this.perm[S+p+this.perm[E+m]]%12,M=this.perm[S+1+this.perm[E+1]]%12,R=.5-g*g-x*x;R<0?n=0:(R*=R,n=R*R*this._dot(this.grad3[A],g,x));let L=.5-y*y-_*_;L<0?s=0:(L*=L,s=L*L*this._dot(this.grad3[b],y,_));let U=.5-v*v-w*w;return U<0?r=0:(U*=U,r=U*U*this._dot(this.grad3[M],v,w)),70*(n+s+r)}noise3d(e,t,n){let s,r,o,a,c=(e+t+n)*.3333333333333333,u=Math.floor(e+c),h=Math.floor(t+c),f=Math.floor(n+c),d=1/6,g=(u+h+f)*d,x=u-g,p=h-g,m=f-g,y=e-x,_=t-p,v=n-m,w,S,E,A,b,M;y>=_?_>=v?(w=1,S=0,E=0,A=1,b=1,M=0):y>=v?(w=1,S=0,E=0,A=1,b=0,M=1):(w=0,S=0,E=1,A=1,b=0,M=1):_<v?(w=0,S=0,E=1,A=0,b=1,M=1):y<v?(w=0,S=1,E=0,A=0,b=1,M=1):(w=0,S=1,E=0,A=1,b=1,M=0);let R=y-w+d,L=_-S+d,U=v-E+d,V=y-A+2*d,X=_-b+2*d,$=v-M+2*d,K=y-1+3*d,O=_-1+3*d,j=v-1+3*d,J=u&255,F=h&255,ie=f&255,pe=this.perm[J+this.perm[F+this.perm[ie]]]%12,ge=this.perm[J+w+this.perm[F+S+this.perm[ie+E]]]%12,oe=this.perm[J+A+this.perm[F+b+this.perm[ie+M]]]%12,Z=this.perm[J+1+this.perm[F+1+this.perm[ie+1]]]%12,ee=.6-y*y-_*_-v*v;ee<0?s=0:(ee*=ee,s=ee*ee*this._dot3(this.grad3[pe],y,_,v));let ye=.6-R*R-L*L-U*U;ye<0?r=0:(ye*=ye,r=ye*ye*this._dot3(this.grad3[ge],R,L,U));let Ee=.6-V*V-X*X-$*$;Ee<0?o=0:(Ee*=Ee,o=Ee*Ee*this._dot3(this.grad3[oe],V,X,$));let Te=.6-K*K-O*O-j*j;return Te<0?a=0:(Te*=Te,a=Te*Te*this._dot3(this.grad3[Z],K,O,j)),32*(s+r+o+a)}noise4d(e,t,n,s){let r=this.grad4,o=this.simplex,a=this.perm,l=(Math.sqrt(5)-1)/4,c=(5-Math.sqrt(5))/20,u,h,f,d,g,x=(e+t+n+s)*l,p=Math.floor(e+x),m=Math.floor(t+x),y=Math.floor(n+x),_=Math.floor(s+x),v=(p+m+y+_)*c,w=p-v,S=m-v,E=y-v,A=_-v,b=e-w,M=t-S,R=n-E,L=s-A,U=b>M?32:0,V=b>R?16:0,X=M>R?8:0,$=b>L?4:0,K=M>L?2:0,O=R>L?1:0,j=U+V+X+$+K+O,J=o[j][0]>=3?1:0,F=o[j][1]>=3?1:0,ie=o[j][2]>=3?1:0,pe=o[j][3]>=3?1:0,ge=o[j][0]>=2?1:0,oe=o[j][1]>=2?1:0,Z=o[j][2]>=2?1:0,ee=o[j][3]>=2?1:0,ye=o[j][0]>=1?1:0,Ee=o[j][1]>=1?1:0,Te=o[j][2]>=1?1:0,Ae=o[j][3]>=1?1:0,Re=b-J+c,N=M-F+c,fe=R-ie+c,le=L-pe+c,ce=b-ge+2*c,de=M-oe+2*c,Y=R-Z+2*c,G=L-ee+2*c,H=b-ye+3*c,se=M-Ee+3*c,me=R-Te+3*c,I=L-Ae+3*c,T=b-1+4*c,W=M-1+4*c,te=R-1+4*c,ve=L-1+4*c,P=p&255,z=m&255,ne=y&255,k=_&255,ue=a[P+a[z+a[ne+a[k]]]]%32,xe=a[P+J+a[z+F+a[ne+ie+a[k+pe]]]]%32,Ie=a[P+ge+a[z+oe+a[ne+Z+a[k+ee]]]]%32,Ge=a[P+ye+a[z+Ee+a[ne+Te+a[k+Ae]]]]%32,We=a[P+1+a[z+1+a[ne+1+a[k+1]]]]%32,Fe=.6-b*b-M*M-R*R-L*L;Fe<0?u=0:(Fe*=Fe,u=Fe*Fe*this._dot4(r[ue],b,M,R,L));let Je=.6-Re*Re-N*N-fe*fe-le*le;Je<0?h=0:(Je*=Je,h=Je*Je*this._dot4(r[xe],Re,N,fe,le));let q=.6-ce*ce-de*de-Y*Y-G*G;q<0?f=0:(q*=q,f=q*q*this._dot4(r[Ie],ce,de,Y,G));let Ce=.6-H*H-se*se-me*me-I*I;Ce<0?d=0:(Ce*=Ce,d=Ce*Ce*this._dot4(r[Ge],H,se,me,I));let De=.6-T*T-W*W-te*te-ve*ve;return De<0?g=0:(De*=De,g=De*De*this._dot4(r[We],T,W,te,ve)),27*(u+h+f+d+g)}_dot(e,t,n){return e[0]*t+e[1]*n}_dot3(e,t,n,s){return e[0]*t+e[1]*n+e[2]*s}_dot4(e,t,n,s,r){return e[0]*t+e[1]*n+e[2]*s+e[3]*r}};var Hr=class i extends yn{constructor(e,t,n=512,s=512,r,o,a){super(),this.width=n,this.height=s,this.clear=!0,this.camera=t,this.scene=e,this.output=0,this._renderGBuffer=!0,this._visibilityCache=[],this.blendIntensity=1,this.pdRings=2,this.pdRadiusExponent=2,this.pdSamples=16,this.gtaoNoiseTexture=Sp(),this.pdNoiseTexture=this._generateNoise(),this.gtaoRenderTarget=new Lt(this.width,this.height,{type:$t}),this.pdRenderTarget=this.gtaoRenderTarget.clone(),this.gtaoMaterial=new dt({defines:Object.assign({},Zo.defines),uniforms:Cn.clone(Zo.uniforms),vertexShader:Zo.vertexShader,fragmentShader:Zo.fragmentShader,blending:tn,depthTest:!1,depthWrite:!1}),this.gtaoMaterial.defines.PERSPECTIVE_CAMERA=this.camera.isPerspectiveCamera?1:0,this.gtaoMaterial.uniforms.tNoise.value=this.gtaoNoiseTexture,this.gtaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.normalMaterial=new Ro,this.normalMaterial.blending=tn,this.pdMaterial=new dt({defines:Object.assign({},$o.defines),uniforms:Cn.clone($o.uniforms),vertexShader:$o.vertexShader,fragmentShader:$o.fragmentShader,depthTest:!1,depthWrite:!1}),this.pdMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.pdMaterial.uniforms.tNoise.value=this.pdNoiseTexture,this.pdMaterial.uniforms.resolution.value.set(this.width,this.height),this.pdMaterial.uniforms.lumaPhi.value=10,this.pdMaterial.uniforms.depthPhi.value=2,this.pdMaterial.uniforms.normalPhi.value=3,this.pdMaterial.uniforms.radius.value=8,this.depthRenderMaterial=new dt({defines:Object.assign({},Ko.defines),uniforms:Cn.clone(Ko.uniforms),vertexShader:Ko.vertexShader,fragmentShader:Ko.fragmentShader,blending:tn}),this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new dt({uniforms:Cn.clone(Pi.uniforms),vertexShader:Pi.vertexShader,fragmentShader:Pi.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:Uo,blendDst:Gs,blendEquation:Zn,blendSrcAlpha:No,blendDstAlpha:Gs,blendEquationAlpha:Zn}),this.blendMaterial=new dt({uniforms:Cn.clone(Sc.uniforms),vertexShader:Sc.vertexShader,fragmentShader:Sc.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blending:sl,blendSrc:Uo,blendDst:Gs,blendEquation:Zn,blendSrcAlpha:No,blendDstAlpha:Gs,blendEquationAlpha:Zn}),this._fsQuad=new Hn(null),this._originalClearColor=new we,this.setGBuffer(r?r.depthTexture:void 0,r?r.normalTexture:void 0),o!==void 0&&this.updateGtaoMaterial(o),a!==void 0&&this.updatePdMaterial(a)}setSize(e,t){this.width=e,this.height=t,this.gtaoRenderTarget.setSize(e,t),this.normalRenderTarget.setSize(e,t),this.pdRenderTarget.setSize(e,t),this.gtaoMaterial.uniforms.resolution.value.set(e,t),this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.pdMaterial.uniforms.resolution.value.set(e,t),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse)}dispose(){this.gtaoNoiseTexture.dispose(),this.pdNoiseTexture.dispose(),this.normalRenderTarget.dispose(),this.gtaoRenderTarget.dispose(),this.pdRenderTarget.dispose(),this.normalMaterial.dispose(),this.pdMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this._fsQuad.dispose()}get gtaoMap(){return this.pdRenderTarget.texture}setGBuffer(e,t){e!==void 0?(this.depthTexture=e,this.normalTexture=t,this._renderGBuffer=!1):(this.depthTexture=new Fs,this.depthTexture.format=ms,this.depthTexture.type=ps,this.normalRenderTarget=new Lt(this.width,this.height,{minFilter:Zt,magFilter:Zt,type:$t,depthTexture:this.depthTexture}),this.normalTexture=this.normalRenderTarget.texture,this._renderGBuffer=!0);let n=this.normalTexture?1:0,s=this.depthTexture===this.normalTexture?"w":"x";this.gtaoMaterial.defines.NORMAL_VECTOR_TYPE=n,this.gtaoMaterial.defines.DEPTH_SWIZZLING=s,this.gtaoMaterial.uniforms.tNormal.value=this.normalTexture,this.gtaoMaterial.uniforms.tDepth.value=this.depthTexture,this.pdMaterial.defines.NORMAL_VECTOR_TYPE=n,this.pdMaterial.defines.DEPTH_SWIZZLING=s,this.pdMaterial.uniforms.tNormal.value=this.normalTexture,this.pdMaterial.uniforms.tDepth.value=this.depthTexture,this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture}setSceneClipBox(e){e?(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX!==1,this.gtaoMaterial.defines.SCENE_CLIP_BOX=1,this.gtaoMaterial.uniforms.sceneBoxMin.value.copy(e.min),this.gtaoMaterial.uniforms.sceneBoxMax.value.copy(e.max)):(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX===0,this.gtaoMaterial.defines.SCENE_CLIP_BOX=0)}updateGtaoMaterial(e){e.radius!==void 0&&(this.gtaoMaterial.uniforms.radius.value=e.radius),e.distanceExponent!==void 0&&(this.gtaoMaterial.uniforms.distanceExponent.value=e.distanceExponent),e.thickness!==void 0&&(this.gtaoMaterial.uniforms.thickness.value=e.thickness),e.distanceFallOff!==void 0&&(this.gtaoMaterial.uniforms.distanceFallOff.value=e.distanceFallOff,this.gtaoMaterial.needsUpdate=!0),e.scale!==void 0&&(this.gtaoMaterial.uniforms.scale.value=e.scale),e.samples!==void 0&&e.samples!==this.gtaoMaterial.defines.SAMPLES&&(this.gtaoMaterial.defines.SAMPLES=e.samples,this.gtaoMaterial.needsUpdate=!0),e.screenSpaceRadius!==void 0&&(e.screenSpaceRadius?1:0)!==this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS&&(this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS=e.screenSpaceRadius?1:0,this.gtaoMaterial.needsUpdate=!0)}updatePdMaterial(e){let t=!1;e.lumaPhi!==void 0&&(this.pdMaterial.uniforms.lumaPhi.value=e.lumaPhi),e.depthPhi!==void 0&&(this.pdMaterial.uniforms.depthPhi.value=e.depthPhi),e.normalPhi!==void 0&&(this.pdMaterial.uniforms.normalPhi.value=e.normalPhi),e.radius!==void 0&&e.radius!==this.radius&&(this.pdMaterial.uniforms.radius.value=e.radius),e.radiusExponent!==void 0&&e.radiusExponent!==this.pdRadiusExponent&&(this.pdRadiusExponent=e.radiusExponent,t=!0),e.rings!==void 0&&e.rings!==this.pdRings&&(this.pdRings=e.rings,t=!0),e.samples!==void 0&&e.samples!==this.pdSamples&&(this.pdSamples=e.samples,t=!0),t&&(this.pdMaterial.defines.SAMPLES=this.pdSamples,this.pdMaterial.defines.SAMPLE_VECTORS=Ch(this.pdSamples,this.pdRings,this.pdRadiusExponent),this.pdMaterial.needsUpdate=!0)}render(e,t,n){switch(this._renderGBuffer&&(this._overrideVisibility(),this._renderOverride(e,this.normalMaterial,this.normalRenderTarget,7829503,1),this._restoreVisibility()),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.gtaoMaterial.uniforms.cameraWorldMatrix.value.copy(this.camera.matrixWorld),this._renderPass(e,this.gtaoMaterial,this.gtaoRenderTarget,16777215,1),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this._renderPass(e,this.pdMaterial,this.pdRenderTarget,16777215,1),this.output){case i.OUTPUT.Off:break;case i.OUTPUT.Diffuse:this.copyMaterial.uniforms.tDiffuse.value=n.texture,this.copyMaterial.blending=tn,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case i.OUTPUT.AO:this.copyMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.copyMaterial.blending=tn,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case i.OUTPUT.Denoise:this.copyMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.copyMaterial.blending=tn,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case i.OUTPUT.Depth:this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this._renderPass(e,this.depthRenderMaterial,this.renderToScreen?null:t);break;case i.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=tn,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case i.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=n.texture,this.copyMaterial.blending=tn,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t),this.blendMaterial.uniforms.intensity.value=this.blendIntensity,this.blendMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this._renderPass(e,this.blendMaterial,this.renderToScreen?null:t);break;default:console.warn("THREE.GTAOPass: Unknown output type.")}}_renderPass(e,t,n,s,r){e.getClearColor(this._originalClearColor);let o=e.getClearAlpha(),a=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,s!=null&&(e.setClearColor(s),e.setClearAlpha(r||0),e.clear()),this._fsQuad.material=t,this._fsQuad.render(e),e.autoClear=a,e.setClearColor(this._originalClearColor),e.setClearAlpha(o)}_renderOverride(e,t,n,s,r){e.getClearColor(this._originalClearColor);let o=e.getClearAlpha(),a=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,s=t.clearColor||s,r=t.clearAlpha||r,s!=null&&(e.setClearColor(s),e.setClearAlpha(r||0),e.clear()),this.scene.overrideMaterial=t,e.render(this.scene,this.camera),this.scene.overrideMaterial=null,e.autoClear=a,e.setClearColor(this._originalClearColor),e.setClearAlpha(o)}_overrideVisibility(){let e=this.scene,t=this._visibilityCache;e.traverse(function(n){(n.isPoints||n.isLine||n.isLine2)&&n.visible&&(n.visible=!1,t.push(n))})}_restoreVisibility(){let e=this._visibilityCache;for(let t=0;t<e.length;t++)e[t].visible=!0;e.length=0}_generateNoise(e=64){let t=new bc,n=e*e*4,s=new Uint8Array(n);for(let o=0;o<e;o++)for(let a=0;a<e;a++){let l=o,c=a;s[(o*e+a)*4]=(t.noise(l,c)*.5+.5)*255,s[(o*e+a)*4+1]=(t.noise(l+e,c)*.5+.5)*255,s[(o*e+a)*4+2]=(t.noise(l,c+e)*.5+.5)*255,s[(o*e+a)*4+3]=(t.noise(l+e,c+e)*.5+.5)*255}let r=new ui(s,e,e,dn,vn);return r.wrapS=bn,r.wrapT=bn,r.needsUpdate=!0,r}};Hr.OUTPUT={Off:-1,Default:0,Diffuse:1,Depth:2,Normal:3,AO:4,Denoise:5};var bp={name:"LuminosityHighPassShader",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new we(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};var zr=class i extends yn{constructor(e,t=1,n,s){super(),this.strength=t,this.radius=n,this.threshold=s,this.resolution=e!==void 0?new be(e.x,e.y):new be(256,256),this.clearColor=new we(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);this.renderTargetBright=new Lt(r,o,{type:$t}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let u=0;u<this.nMips;u++){let h=new Lt(r,o,{type:$t});h.texture.name="UnrealBloomPass.h"+u,h.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(h);let f=new Lt(r,o,{type:$t});f.texture.name="UnrealBloomPass.v"+u,f.texture.generateMipmaps=!1,this.renderTargetsVertical.push(f),r=Math.round(r/2),o=Math.round(o/2)}let a=bp;this.highPassUniforms=Cn.clone(a.uniforms),this.highPassUniforms.luminosityThreshold.value=s,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new dt({uniforms:this.highPassUniforms,vertexShader:a.vertexShader,fragmentShader:a.fragmentShader}),this.separableBlurMaterials=[];let l=[3,5,7,9,11];r=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);for(let u=0;u<this.nMips;u++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[u])),this.separableBlurMaterials[u].uniforms.invSize.value=new be(1/r,1/o),r=Math.round(r/2),o=Math.round(o/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new D(1,1,1),new D(1,1,1),new D(1,1,1),new D(1,1,1),new D(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=Cn.clone(Pi.uniforms),this.blendMaterial=new dt({uniforms:this.copyUniforms,vertexShader:Pi.vertexShader,fragmentShader:Pi.fragmentShader,blending:fs,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new we,this._oldClearAlpha=1,this._basic=new Xi,this._fsQuad=new Hn(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),s=Math.round(t/2);this.renderTargetBright.setSize(n,s);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(n,s),this.renderTargetsVertical[r].setSize(n,s),this.separableBlurMaterials[r].uniforms.invSize.value=new be(1/n,1/s),n=Math.round(n/2),s=Math.round(s/2)}render(e,t,n,s,r){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();let o=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),r&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=n.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let a=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this._fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=a.texture,this.separableBlurMaterials[l].uniforms.direction.value=i.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=i.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this._fsQuad.render(e),a=this.renderTargetsVertical[l];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(n),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=o}_getSeparableBlurMaterial(e){let t=[];for(let n=0;n<e;n++)t.push(.39894*Math.exp(-.5*n*n/(e*e))/e);return new dt({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new be(.5,.5)},direction:{value:new be(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`})}_getCompositeMaterial(e){return new dt({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`})}};zr.BlurDirectionX=new be(1,0);zr.BlurDirectionY=new be(0,1);var Jo={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};var Ec=class extends yn{constructor(){super(),this.uniforms=Cn.clone(Jo.uniforms),this.material=new Ao({name:Jo.name,uniforms:this.uniforms,vertexShader:Jo.vertexShader,fragmentShader:Jo.fragmentShader}),this._fsQuad=new Hn(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},yt.getTransfer(this._outputColorSpace)===Tt&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===fl?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===dl?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===pl?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===ml?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===Ar?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===xl?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===gl&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var Ep="varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }",Ph=class extends yn{constructor(e,t,n,s={}){super(),this.scene=e,this.camera=t,this.hide=n,this._rt=new Lt(4,4,{minFilter:Zt,magFilter:Zt,depthBuffer:!0}),this._rt.texture.name="dof.depth",this._depth=new cs({depthPacking:Cr}),this.uniforms={tColor:{value:null},tDepth:{value:this._rt.texture},uFocus:{value:s.focus??6},uAperture:{value:s.aperture??2},uMaxblur:{value:s.maxblur??.011},uNear:{value:t.near},uFar:{value:t.far},uAspect:{value:t.aspect}},this._mat=new dt({uniforms:this.uniforms,defines:{TAPS:36},vertexShader:Ep,fragmentShader:`
        uniform sampler2D tColor, tDepth;
        uniform float uFocus, uAperture, uMaxblur, uNear, uFar, uAspect;
        varying vec2 vUv;
        #include <common>
        #include <packing>
        float cocAt( vec2 uv ) {                                             // > 0 \u8FDC\u4E8E\u7126\u70B9\uFF0C< 0 \u8FD1\u4E8E\u7126\u70B9\uFF1B\u5355\u4F4D = \u6700\u5927\u6A21\u7CCA\u534A\u5F84
          float vz = - perspectiveDepthToViewZ( texture2D( tDepth, uv ).x, uNear, uFar );
          return clamp( uAperture * ( 1.0 / uFocus - 1.0 / max( vz, 0.05 ) ), - 1.0, 1.0 );
        }
        void main() {
          float coc = cocAt( vUv );
          vec4 acc = texture2D( tColor, vUv );
          float wsum = 1.0;
          float rot = fract( 52.9829189 * fract( dot( gl_FragCoord.xy, vec2( 0.06711056, 0.00583715 ) ) ) ) * 6.2831853;   // \u6BCF\u50CF\u7D20\u65CB\u8F6C\uFF0C\u9690\u85CF\u91C7\u6837\u82B1\u7EB9
          vec2 scale = uMaxblur * vec2( 1.0 / uAspect, 1.0 );
          for ( int i = 0; i < TAPS; i ++ ) {
            float t = sqrt( ( float( i ) + 0.5 ) / float( TAPS ) ), a = float( i ) * 2.39996 + rot;
            vec2 uvT = vUv + vec2( cos( a ), sin( a ) ) * t * scale;
            float ci = cocAt( uvT );
            float w = smoothstep( t - 0.08, t + 0.08, abs( ci ) );
            w *= ( ci < 0.0 || coc >= 0.0 ) ? 1.0 : 0.0;                   // \u4E2D\u5FC3\u662F\u524D\u666F\u65F6\u53EA\u6536\u96C6\u524D\u666F
            acc += texture2D( tColor, uvT ) * w;
            wsum += w;
          }
          gl_FragColor = vec4( acc.rgb / wsum, 1.0 );
        }`}),this._quad=new Hn(this._mat),this.needsSwap=!0}setSize(e,t){this._rt.setSize(e,t),this.uniforms.uAspect.value=e/t}render(e,t,n){let s=Tp(this.hide),r=e.getRenderTarget(),o=e.autoClear,a=e.getClearColor(new we),l=e.getClearAlpha();e.setRenderTarget(this._rt),e.setClearColor(16777215,1),e.clear(),this.scene.overrideMaterial=this._depth,e.render(this.scene,this.camera),this.scene.overrideMaterial=null,e.setClearColor(a,l),e.setRenderTarget(r),e.autoClear=o,wp(s),this.uniforms.tColor.value=n.texture,e.setRenderTarget(this.renderToScreen?null:t),this._quad.render(e)}dispose(){this._rt.dispose(),this._depth.dispose(),this._mat.dispose(),this._quad.dispose()}},Ih=class extends Hr{constructor(e,t,n,s,r){super(e,t,n,s),this._hide=[],this.hide=r}_overrideVisibility(){super._overrideVisibility(),Tp(this.hide,this._hide)}_restoreVisibility(){super._restoreVisibility(),wp(this._hide),this._hide.length=0}};function Tp(i,e=[]){for(let t of i)t&&t.visible&&(t.visible=!1,e.push(t));return e}function wp(i){for(let e of i)e.visible=!0}var I_={uniforms:{tDiffuse:{value:null},uTexel:{value:new be(1/1920,1/1080)},uSat:{value:1.34},uContrast:{value:1.09},uSharp:{value:.2},uVignette:{value:.34},uGrain:{value:.026},uCA:{value:.0032},uShadowTint:{value:new D(-.012,0,.03)},uHighTint:{value:new D(.024,.006,-.024)},uTint:{value:1},uTime:{value:0}},vertexShader:Ep,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform vec2 uTexel;
    uniform float uSat, uContrast, uSharp, uVignette, uGrain, uCA, uTint, uTime;
    uniform vec3 uShadowTint, uHighTint;
    varying vec2 vUv;
    float hash( vec2 p ) { return fract( sin( dot( p, vec2( 127.1, 3.11 ) ) ) * 43758.5453 ); }
    float lum( vec3 c ) { return dot( c, vec3( 0.2126, 0.7152, 0.0722 ) ); }
    void main() {
      vec2 c = vUv - 0.5;
      vec2 ca = c * dot( c, c ) * uCA;                                       // \u8272\u5DEE\uFF1A\u8D8A\u9760\u753B\u9762\u8FB9\u7F18\u8D8A\u660E\u663E
      vec3 col = vec3( texture2D( tDiffuse, vUv + ca ).r, texture2D( tDiffuse, vUv ).g, texture2D( tDiffuse, vUv - ca ).b );
      vec3 nb = texture2D( tDiffuse, vUv + vec2( uTexel.x, 0.0 ) ).rgb + texture2D( tDiffuse, vUv - vec2( uTexel.x, 0.0 ) ).rgb
              + texture2D( tDiffuse, vUv + vec2( 0.0, uTexel.y ) ).rgb + texture2D( tDiffuse, vUv - vec2( 0.0, uTexel.y ) ).rgb;
      col += ( col - nb * 0.25 ) * uSharp;                                   // \u8F7B\u9510\u5316\uFF1A\u8272\u8C03\u6620\u5C04\u4E4B\u540E\u7684\u753B\u9762\u504F\u8F6F
      float l = lum( col );
      col += ( uShadowTint * ( 1.0 - l ) * ( 1.0 - l ) + uHighTint * l * l ) * uTint;
      col = mix( vec3( lum( col ) ), col, uSat );
      col = ( col - 0.5 ) * uContrast + 0.5;
      vec2 vc = c * vec2( 1.0, 0.86 );
      col *= 1.0 - uVignette * smoothstep( 0.1, 0.62, dot( vc, vc ) );
      float g = hash( vUv * vec2( 1917.0, 1077.0 ) + fract( uTime * 7.31 ) * 173.0 ) - 0.5;   // \u9897\u7C92\uFF1A\u4E2D\u95F4\u8C03\u6700\u591A\uFF0C\u4EAE\u90E8\u6700\u5C11
      col += g * uGrain * ( 1.0 - l * 0.75 );
      col += ( hash( vUv * 913.7 + 0.31 ) - 0.5 ) / 255.0;                   // \u6296\u52A8\uFF1A\u6D88\u9664 8 \u4F4D\u6E10\u53D8\u8272\u5E26
      gl_FragColor = vec4( clamp( col, 0.0, 1.0 ), 1.0 );
    }`};function Ap(i,e,t,n){let s=i.getDrawingBufferSize(new be),r=i.extensions.has("EXT_color_buffer_float"),o=new Lt(s.x,s.y,{type:r?$t:vn,depthBuffer:!0,stencilBuffer:!1,samples:r?4:0});o.texture.name="hdr";let a=new _c(i,o),l=new Mc(e,t),c=new Ih(e,t,s.x,s.y,n);c.output=Hr.OUTPUT.Default,c.blendIntensity=.85,c.updateGtaoMaterial({radius:.3,distanceExponent:1.4,thickness:1,scale:1.1,samples:12,distanceFallOff:1,screenSpaceRadius:!1});let u=new zr(new be(s.x,s.y),.3,.5,1),h=new Ph(e,t,n,{focus:6,aperture:2,maxblur:.011}),f=new Ec,d=new kr(I_);a.addPass(l),a.addPass(c),a.addPass(u),a.addPass(h),a.addPass(f),a.addPass(d),d.uniforms.uTexel.value.set(1/s.x,1/s.y);let g={composer:a,gtao:c,bloom:u,dof:h,finish:d,floatOK:r,dofWanted:!0,render(x){d.uniforms.uTime.value=(d.uniforms.uTime.value+x)%1e3,a.render()},setSize(x,p){a.setSize(x,p),d.uniforms.uTexel.value.set(1/x,1/p),u.setSize(x*.5,p*.5)},setSamples(x){for(let p of[o,a.renderTarget1,a.renderTarget2])p.samples=x,p.dispose()},setQuality(x){c.enabled=x>=1,h.enabled=x>=2&&g.dofWanted,g.setSamples(r?[0,2,4][x]:0)}};return g.setSize(s.x,s.y),g}var Be=Object.freeze({half:2.6,curbW:.26,curbH:.13,walkOut:3.3,walkIn:1.7});function D_(i,e,t,n){let s=i*(1+.1*Math.cos(2*n-.6)+.055*Math.sin(3*n+1)+.03*Math.sin(7*n+2));return[s*Math.sin(n)*e,s*Math.cos(n)*t]}function Tc(i={}){let e=i.R0??150,t=i.sx??.6,n=i.sz??1,s=i.n??48,r=i.sub??32,o=[];for(let R=0;R<s;R++)o.push(D_(e,t,n,R/s*He));let a=(R,L,U,V)=>{let X=o[(R+s-1)%s],$=o[R],K=o[(R+1)%s],O=o[(R+2)%s],j=L*L,J=j*L;for(let F=0;F<2;F++){let ie=X[F],pe=$[F],ge=K[F],oe=O[F];U&&(U[F]=.5*(2*pe+(-ie+ge)*L+(2*ie-5*pe+4*ge-oe)*j+(-ie+3*pe-3*ge+oe)*J)),V&&(V[F]=.5*(-ie+ge+2*(2*ie-5*pe+4*ge-oe)*L+3*(-ie+3*pe-3*ge+oe)*j))}},l=s*r,c=new Float64Array(l+1),u=new Float64Array(l+1),h=new Float64Array(l+1);{let R=[0,0],L=null;for(let U=0;U<=l;U++)a(Math.floor(U/r)%s,U%r/r,R,null),u[U]=R[0],h[U]=R[1],L&&(c[U]=c[U-1]+Math.hypot(R[0]-L[0],R[1]-L[1])),L=[R[0],R[1]]}let f=c[l],d=He*2/f,g=He*5/f,x=R=>3.3+1.25*Math.sin(d*R+.4)+.65*Math.sin(g*R+1.7),p=R=>1.25*d*Math.cos(d*R+.4)+.65*g*Math.cos(g*R+1.7),m=[0,0],y=[0,0],_=R=>{R=(R%f+f)%f;let L=0,U=l;for(;U-L>1;){let X=L+U>>1;c[X]<=R?L=X:U=X}let V=c[L+1]-c[L]||1e-9;return[Math.floor(L/r)%s,(L%r+(R-c[L])/V)/r]},v={pos:[0,0,0],fwd:[0,0,1],right:[-1,0,0],up:[0,1,0],yaw:0,slope:0,y:0,s:0,bank:0};function w(R,L=v){let[U,V]=_(R);a(U,V,m,y);let X=Math.hypot(y[0],y[1])||1e-9,$=y[0]/X,K=y[1]/X,O=p(R),j=x(R);L.pos||=[0,0,0],L.fwd||=[0,0,1],L.right||=[0,0,0],L.up||=[0,1,0];let J=Math.hypot(1,O);return L.pos[0]=m[0],L.pos[1]=j,L.pos[2]=m[1],L.fwd[0]=$/J,L.fwd[1]=O/J,L.fwd[2]=K/J,L.right[0]=-K,L.right[1]=0,L.right[2]=$,L.up[0]=-$*(O/J),L.up[1]=1/J,L.up[2]=-K*(O/J),L.yaw=Math.atan2($,K),L.slope=O,L.y=j,L.s=(R%f+f)%f,L}function S(R){let L=w(R-1.5,{}).yaw,V=w(R+1.5,{}).yaw-L;return V=((V+Math.PI)%He+He)%He-Math.PI,V/3}let E=4,A={s:0,u:0,x:0,z:0,d2:0};function b(R,L,U=A){let V=0,X=1/0;for(let ee=0;ee<l;ee+=E){let ye=u[ee]-R,Ee=h[ee]-L,Te=ye*ye+Ee*Ee;Te<X&&(X=Te,V=ee)}let $=c[V],K=u[V],O=h[V],j=X;for(let ee=Math.max(0,V-E);ee<Math.min(l,V+E);ee++){let ye=u[ee],Ee=h[ee],Te=u[ee+1]-ye,Ae=h[ee+1]-Ee,Re=Te*Te+Ae*Ae||1e-12,N=((R-ye)*Te+(L-Ee)*Ae)/Re;N=ct(N,0,1);let fe=ye+Te*N,le=Ee+Ae*N,ce=R-fe,de=L-le,Y=ce*ce+de*de;Y<j&&(j=Y,K=fe,O=le,$=c[ee]+(c[ee+1]-c[ee])*N)}let[J,F]=_($);a(J,F,m,y);let ie=Math.hypot(y[0],y[1])||1e-9,pe=y[0]/ie,oe=-(y[1]/ie),Z=pe;return U.s=$,U.x=K,U.z=O,U.d2=j,U.u=(R-K)*oe+(L-O)*Z,U.y=x($),U}let M={minX:1/0,maxX:-1/0,minZ:1/0,maxZ:-1/0};for(let R=0;R<l;R++)M.minX=Math.min(M.minX,u[R]),M.maxX=Math.max(M.maxX,u[R]),M.minZ=Math.min(M.minZ,h[R]),M.maxZ=Math.max(M.maxZ,h[R]);return{length:f,ctrl:o,roadY:x,slope:p,frameAt:w,nearest:b,curvatureAt:S,bounds:M,evalXY:R=>{let L=w(R,{});return[L.pos[0],L.pos[2]]}}}function ii(i,e,t,n){n=i.nearest(e,t,n||{});let s=n.y,r=n.u,o=Math.abs(r),a=Be.half+Be.curbW;if(o<=Be.half){let m=o/Be.half;return s+.05*(1-m*m)}if(o<=a)return s+Be.curbH;let l=o-a,c=Be.half+2.5,u=kn(c,c+9,o);if(r>0){if(l<=Be.walkOut)return s+Be.curbH;let m=l-Be.walkOut,y=s+Be.curbH-.3,_=.3,v=y-m*_;return v<-2.5&&(v=-2.5-(m-(y+2.5)/_)*.06),m<2&&(v=(s+Be.curbH)*(1-kn(0,2,m))+v*kn(0,2,m)),v+dc(e*.09,t*.09,2,3)*.1*kn(0,4,m)}if(l<=Be.walkIn)return s+Be.curbH;let h=l-Be.walkIn,f=4,d=s+(f-s)*kn(0,25,h),g=17*Math.pow(kn(0,78,h),1.15),x=d+Be.curbH+g+dc(e*.035,t*.035,3,5)*2.2*kn(0,25,h)+dc(e*.2,t*.2,2,9)*.25*u,p=s+Be.curbH-.045*(1-kn(0,1.2,h))+.012*h;return x+Math.min(0,p-x)*(1-kn(2.4,4.5,h))}var QE=Be.half+Be.curbW+Be.walkIn,eT=Be.half+Be.curbW+Be.walkOut;function jo(i,e){let t=Math.abs(i);return t<=Be.half?3:t<=Be.half+Be.curbW+(i>0?Be.walkOut:Be.walkIn)?2:i>0?e>.9?0:1:0}var Qo=new D;function hi(i,e,t,n,s,r){let o=2*Math.PI*s/4,a=Math.max(r-2*s,0),l=Math.PI/4;Qo.copy(e),Qo[n]=0,Qo.normalize();let c=.5*o/(o+a),u=1-Qo.angleTo(i)/l;return Math.sign(Qo[t])===1?u*c:a/(o+a)+c+c*(1-u)}var wc=class i extends os{constructor(e=1,t=1,n=1,s=2,r=.1){let o=s*2+1;if(r=Math.min(e/2,t/2,n/2,r),super(1,1,1,o,o,o),this.type="RoundedBoxGeometry",this.parameters={width:e,height:t,depth:n,segments:s,radius:r},o===1)return;let a=this.toNonIndexed();this.index=null,this.attributes.position=a.attributes.position,this.attributes.normal=a.attributes.normal,this.attributes.uv=a.attributes.uv;let l=new D,c=new D,u=new D(e,t,n).divideScalar(2).subScalar(r),h=this.attributes.position.array,f=this.attributes.normal.array,d=this.attributes.uv.array,g=h.length/6,x=new D,p=.5/o;for(let m=0,y=0;m<h.length;m+=3,y+=2)switch(l.fromArray(h,m),c.copy(l),c.x-=Math.sign(c.x)*p,c.y-=Math.sign(c.y)*p,c.z-=Math.sign(c.z)*p,c.normalize(),h[m+0]=u.x*Math.sign(l.x)+c.x*r,h[m+1]=u.y*Math.sign(l.y)+c.y*r,h[m+2]=u.z*Math.sign(l.z)+c.z*r,f[m+0]=c.x,f[m+1]=c.y,f[m+2]=c.z,Math.floor(m/g)){case 0:x.set(1,0,0),d[y+0]=hi(x,c,"z","y",r,n),d[y+1]=1-hi(x,c,"y","z",r,t);break;case 1:x.set(-1,0,0),d[y+0]=1-hi(x,c,"z","y",r,n),d[y+1]=1-hi(x,c,"y","z",r,t);break;case 2:x.set(0,1,0),d[y+0]=1-hi(x,c,"x","z",r,e),d[y+1]=hi(x,c,"z","x",r,n);break;case 3:x.set(0,-1,0),d[y+0]=1-hi(x,c,"x","z",r,e),d[y+1]=1-hi(x,c,"z","x",r,n);break;case 4:x.set(0,0,1),d[y+0]=1-hi(x,c,"x","y",r,e),d[y+1]=1-hi(x,c,"y","x",r,t);break;case 5:x.set(0,0,-1),d[y+0]=hi(x,c,"x","y",r,e),d[y+1]=1-hi(x,c,"y","x",r,t);break}}static fromJSON(e){return new i(e.width,e.height,e.depth,e.segments,e.radius)}};var Dh=i=>i.isVector3?i:new D(i[0],i[1],i[2]),rt=(i,e,t,n=.02,s=2)=>(n=Math.max(.001,Math.min(n,i/2-1e-4,e/2-1e-4,t/2-1e-4)),new wc(i,e,t,s,n)),Mt=(i,e=24,t=16)=>new $n(i,e,t),ea=(i,e,t,n=24,s=16)=>{let r=new $n(1,n,s);return r.scale(i,e,t),r},it=(i,e,t,n=16,s=!1)=>new Bn(i,e,t,n,1,s),fi=(i,e,t=10,n=36,s=He)=>new ks(i,e,t,n,s),gn=(i,e,t={})=>new wo(new Ai(i.map(Dh),!!t.closed,"centripetal"),t.tubular??24,e,t.radial??10,!!t.closed);function Ac(i,e,t,n=8){let s=Dh(i),r=Dh(e),o=new D().subVectors(r,s),a=o.length(),l=new Bn(t,t,a,n,1,!1),c=new Ut().setFromUnitVectors(new D(0,1,0),o.normalize());return l.applyMatrix4(new qe().compose(new D().addVectors(s,r).multiplyScalar(.5),c,new D(1,1,1))),l}function nn(i,e,t={}){let n=new ls(i.map(r=>new be(r[0],r[1]))),s=new Os(n,{depth:e,bevelEnabled:(t.bevel??.01)>0,bevelThickness:t.bevel??.01,bevelSize:(t.bevel??.01)*(t.bevelW??1),bevelSegments:t.bevelSeg??2,curveSegments:t.curveSeg??10});return s.translate(0,0,-(e/2)),s}function Rp(i,e,t={}){let n=[],s=t.n??14,r=t.tip??.55,o=t.belly??.45;for(let a=0;a<=s;a++){let l=a/s,c=e*Math.pow(Math.sin(Math.PI*Math.pow(l,o*1.6+.2)),r)*(1-.15*l);n.push([c,l*i])}for(let a=s;a>=0;a--){let l=a/s,c=e*Math.pow(Math.sin(Math.PI*Math.pow(l,o*1.6+.2)),r)*(1-.15*l);n.push([-c,l*i])}return n}function Cp(i,e,t,n=6){let s=[],r=i/2,o=e/2;t=Math.min(t,r,o);let a=(l,c,u)=>{for(let h=0;h<=n;h++){let f=u+h/n*(Math.PI/2);s.push([l+t*Math.cos(f),c+t*Math.sin(f)])}};return a(r-t,o-t,0),a(-r+t,o-t,Math.PI/2),a(-r+t,-o+t,Math.PI),a(r-t,-o+t,Math.PI*1.5),s}var L_=`
varying vec3 vDir;
void main() {
  vDir = position;
  vec4 mv = modelViewMatrix * vec4( position, 1.0 );
  gl_Position = projectionMatrix * mv;
  gl_Position.z = gl_Position.w * 0.999999;   // \u6C38\u8FDC\u8D34\u5728\u6700\u8FDC\u5904\uFF1A\u6CA1\u88AB\u522B\u7684\u4E1C\u897F\u906E\u4F4F\u7684\u5730\u65B9\u624D\u770B\u5F97\u5230
}
`,F_=`
uniform vec3 uTop, uHor, uSunDir, uSunCol, uGlow, uMoonDir;
uniform float uSunDisc, uMoon, uStars, uDusk, uTime, uStyle;
uniform vec3 uPaper;
// \u2014\u2014 \u5199\u5B9E \u2014\u2014
uniform float uMode, uNight, uCloud;
uniform sampler2D uSkyTex, uNoiseTex;
uniform vec3 uSunColL, uSkyIrr, uMoonLight;
varying vec3 vDir;
${xc}
float hash3( vec3 p ) { return fract( sin( dot( p, vec3( 127.1, 311.7, 74.7 ) ) ) * 43758.5453 ); }
float fbm4( vec2 p ) { vec4 n = texture2D( uNoiseTex, p ); return n.r * 0.46 + n.g * 0.27 + n.b * 0.17 + n.a * 0.10; }   // \u4E00\u6B21\u53D6\u6837 = \u56DB\u4E2A\u516B\u5EA6
// \u5199\u5B9E\u5929\u7A7A\uFF1A\u5E95\u8272\u67E5\u70D8\u7119\u56FE\uFF08\u5927\u6C14\u6563\u5C04 + \u591C\u7A7A\u5E95\u5149\uFF09\uFF0C\u518D\u53E0\u4E0A\u592A\u9633\u76D8\u3001\u6708\u4EAE\u3001\u661F\u661F\u3001\u4E91\u5C42\u3002
vec3 realSky( vec3 d ) {
  vec3 col = texture2D( uSkyTex, equirectUv2( d ) ).rgb;
  float sd = dot( d, uSunDir ), md = dot( d, uMoonDir );
  vec3 sunCol = uSunColL * smoothstep( - 0.010, 0.004, uSunDir.y ) * uSunDisc;
  // \u592A\u9633\u76D8\uFF08\u534A\u5F84 0.265\xB0\uFF09\uFF1A\u4EAE\u5EA6\u5C01\u9876\uFF0C\u6655\u5708\u4EA4\u7ED9\u6CDB\u5149\u3002\u8D34\u8FD1\u5730\u5E73\u7EBF\u65F6\u88AB\u6D77\u5E73\u7EBF\u5207\u6389
  col = mix( col, sunCol * 60.0, smoothstep( 0.9999863, 0.9999905, sd ) * step( - 0.0025, d.y ) );
  col += sunCol * ( pow( max( sd, 0.0 ), 900.0 ) * 1.4 + pow( max( sd, 0.0 ), 48.0 ) * 0.09 + pow( max( sd, 0.0 ), 6.0 ) * 0.015 );
  float moonVis = uMoon * uNight;
  if ( moonVis > 0.001 ) {
    float mare = texture2D( uNoiseTex, d.xy * 9.0 + d.z * 3.0 ).g;                // \u6708\u6D77\u6591\u5757
    col = mix( col, vec3( 0.96, 0.95, 0.9 ) * ( 1.0 - 0.22 * smoothstep( 0.45, 0.7, mare ) ) * 2.2, smoothstep( 0.9999863, 0.9999905, md ) * moonVis );
    col += ( vec3( 0.5, 0.62, 1.0 ) * pow( max( md, 0.0 ), 160.0 ) * 0.10 + vec3( 0.3, 0.4, 0.7 ) * pow( max( md, 0.0 ), 12.0 ) * 0.02 ) * moonVis;
  }
  if ( uStars > 0.001 && d.y > - 0.02 ) {                                           // \u661F\u661F\uFF1A\u65B9\u5411\u7A7A\u95F4\u683C\u70B9\uFF0C\u6BCF\u683C\u81F3\u591A\u4E00\u9897
    vec3 cell = floor( d * 420.0 );
    float h = hash3( cell );
    float star = smoothstep( 0.30, 0.06, length( fract( d * 420.0 ) - 0.5 ) ) * step( 0.992, h );
    float tw = 0.65 + 0.35 * sin( uTime * ( 1.2 + h * 7.0 ) + h * 90.0 );
    col += vec3( 0.85, 0.9, 1.0 ) * star * tw * uStars * smoothstep( - 0.02, 0.2, d.y ) * ( 0.15 + 0.85 * pow( hash3( cell + 7.0 ), 6.0 ) ) * 0.5;
  }
  if ( d.y > 0.003 ) {                                                             // \u4E91\u5C42\uFF1A\u5355\u4F4D\u7403\u65B9\u5411\u6295\u5230\u4E00\u5F20\u5E73\u9762\u4E0A
    vec2 cp = d.xz / d.y;
    vec2 p = cp * 0.3 + vec2( uTime * 0.004, uTime * 0.0017 );
    float base = fbm4( p ) * 0.62 + fbm4( p * 0.41 + 0.37 ) * 0.24 + fbm4( p * 2.3 + 0.71 ) * 0.14;
    float cov = 0.74 - 0.62 * uCloud;
    float dens = smoothstep( cov, cov + 0.24, base );
    if ( dens > 0.002 ) {
      vec2 sp = normalize( uSunDir.xz + vec2( 1e-4, 0.0 ) );
      float tw = fbm4( p + sp * 0.05 ), tw2 = fbm4( p + sp * 0.13 );
      float light = exp( - 2.6 * tw ) * 0.6 + exp( - 1.2 * tw2 ) * 0.4;           // \u671D\u9633\u4E00\u4FA7\u8584\uFF0C\u900F\u5149
      vec3 key = uSunColL * ${Js.toFixed(1)} * smoothstep( - 0.02, 0.03, uSunDir.y ) + uMoonLight;
      vec3 lit = uSkyIrr * 1.15 + key * ( 0.12 * light + 0.3 * light * light * pow( max( sd, 0.0 ) * 0.5 + 0.5, 6.0 ) );
      float edge = 1.0 - smoothstep( 0.0, 0.5, dens );
      vec3 cc = mix( uSkyIrr * 0.46 + key * 0.012, lit, 0.25 + 0.75 * light ) + lit * edge * 0.3;
      cc = mix( cc, col, 1.0 - exp( - length( cp ) * 0.065 ) );                    // \u8FDC\u5904\u878D\u8FDB\u96FE\u972D
      col = mix( col, cc, dens * smoothstep( 0.002, 0.03, d.y ) * 0.96 );
    }
  }
  return col;
}
float hash2( vec2 p ) { return fract( sin( dot( p, vec2( 127.1, 311.7 ) ) ) * 43758.5453 ); }
void main() {
  vec3 d = normalize( vDir );
  if ( uMode > 0.5 ) { gl_FragColor = vec4( realSky( d ), 1.0 ); return; }
  float y = d.y;
  float t = pow( clamp( y, 0.0, 1.0 ), 0.55 );
  vec3 col = mix( uHor, uTop, t );
  col = mix( uHor * 0.97, col, smoothstep( -0.06, 0.02, y ) );                 // \u5730\u5E73\u7EBF\u4EE5\u4E0B\u538B\u6697\u4E00\u70B9\uFF0C\u6D77\u9762\u96FE\u8272\u4E0E\u4E4B\u8854\u63A5
  // \u9EC4\u660F / \u6E05\u6668\u6696\u5E26\uFF1A\u53EA\u51FA\u73B0\u5728\u592A\u9633\u65B9\u4F4D\u9644\u8FD1
  vec2 sxz = normalize( uSunDir.xz + vec2( 1e-5 ) );
  float az = dot( normalize( d.xz + vec2( 1e-5 ) ), sxz ) * 0.5 + 0.5;
  float band = exp( - abs( y ) * 7.5 ) * pow( az, 2.6 ) * uDusk;
  col = mix( col, uGlow, band * 0.72 );
  // \u592A\u9633
  float sd = dot( d, uSunDir );
  col += uGlow * pow( max( sd, 0.0 ), 48.0 ) * 0.32 * uSunDisc;
  col = mix( col, uSunCol, smoothstep( 0.99974, 0.99988, sd ) * uSunDisc );
  // \u6708\u4EAE\uFF08\u5E26\u4E00\u70B9\u6708\u9762\u6591\u5757\uFF09
  float md = dot( d, uMoonDir );
  float crater = smoothstep( 0.99980, 0.99990, dot( d, normalize( uMoonDir + vec3( 0.007, -0.003, 0.002 ) ) ) )
               + smoothstep( 0.99986, 0.99993, dot( d, normalize( uMoonDir + vec3( -0.004, 0.005, -0.001 ) ) ) );
  col = mix( col, vec3( 0.97, 0.95, 0.86 ) * ( 1.0 - 0.16 * clamp( crater, 0.0, 1.0 ) ), smoothstep( 0.99966, 0.99980, md ) * uMoon );
  col += vec3( 0.55, 0.62, 0.95 ) * pow( max( md, 0.0 ), 36.0 ) * 0.22 * uMoon;
  // \u661F\u661F\uFF1A\u65B9\u5411\u7A7A\u95F4\u91CC\u7684\u683C\u70B9\uFF0C\u6BCF\u683C\u81F3\u591A\u4E00\u9897\uFF0C\u7F13\u6162\u95EA\u70C1
  if ( uStars > 0.001 && y > -0.02 ) {
    vec3 cell = floor( d * 240.0 );
    float h = hash3( cell );
    float r = length( fract( d * 240.0 ) - 0.5 );
    float star = smoothstep( 0.16, 0.05, r ) * step( 0.9955, h );
    float tw = 0.6 + 0.4 * sin( uTime * ( 1.2 + h * 7.0 ) + h * 90.0 );
    col += vec3( 0.92, 0.94, 1.0 ) * star * tw * uStars * smoothstep( -0.02, 0.22, y ) * ( 0.5 + 0.5 * hash3( cell + 7.0 ) );
  }
  // \u753B\u98CE\uFF1A\u6392\u7EBF = \u6DE1\u5F69\uFF08\u989C\u8272\u5411\u7EB8\u8272\u9760\u62E2\uFF09\uFF1B\u7EBF\u7A3F = \u5929\u7A7A\u7559\u767D\uFF0C\u592A\u9633\u53EA\u5269\u4E00\u4E2A\u58A8\u5708
  if ( uStyle > 1.5 ) {
    float ring = smoothstep( 0.99970, 0.99975, sd ) - smoothstep( 0.99990, 0.99994, sd );
    col = mix( uPaper, vec3( 0.16, 0.15, 0.26 ), ring * uSunDisc );
  } else if ( uStyle > 0.5 ) col = mix( col, uPaper, 0.42 );
  col += ( hash2( gl_FragCoord.xy ) - 0.5 ) / 255.0;                           // \u6296\u52A8\uFF1A\u6D88\u9664 8 \u4F4D\u6E10\u53D8\u8272\u5E26
  gl_FragColor = vec4( col, 1.0 );
}
`;function Pp(i){let e={uTop:{value:new we(.2,.55,.92)},uHor:{value:new we(.78,.9,.97)},uSunDir:{value:new D(0,1,0)},uSunCol:{value:new we(1,1,1)},uGlow:{value:new we(1,1,1)},uMoonDir:{value:new D(0,1,0)},uSunDisc:{value:1},uMoon:{value:0},uStars:{value:0},uDusk:{value:0},uTime:{value:0},uStyle:i.uStyle,uPaper:i.uPaper,uMode:i.uMode,uNight:{value:0},uCloud:{value:.4},uSkyTex:{value:null},uNoiseTex:{value:null},uSunColL:{value:new we(1,1,1)},uSkyIrr:{value:new we},uMoonLight:{value:new we}},t=new dt({uniforms:e,vertexShader:L_,fragmentShader:F_,side:rn,depthWrite:!1,fog:!1}),n=new $e(new $n(10,32,16),t);n.scale.setScalar(250),n.name="sky",n.renderOrder=-1e3,n.frustumCulled=!1;function s(o,a){e.uTop.value.setRGB(...o.skyTop),e.uHor.value.setRGB(...o.skyHorizon),e.uSunDir.value.copy(a);let l=e.uSunCol.value.setRGB(...o.sunColor);l.r=Math.min(1,Math.max(.75,l.r*1.3)),l.g=Math.min(1,Math.max(.75,l.g*1.3)),l.b=Math.min(1,Math.max(.75,l.b*1.3)),e.uGlow.value.setRGB(...o.sunGlow),e.uSunDisc.value=o.sunDisc,e.uMoon.value=o.moon,e.uStars.value=o.stars;let c=Math.max(0,1-Math.abs(o.sunEl-4)/16)*(o.hour>10&&o.hour<20?.85:1);e.uDusk.value=Math.min(1,c),e.uMoonDir.value.set(-a.x*.6,.62,-a.z*.6).normalize()}return{dome:n,uniforms:e,applyPalette:s,enableReal(o){e.uSkyTex.value=o.sky.texture,e.uNoiseTex.value=o.tex.noise},applyReal(o,a){e.uSunColL.value.setRGB(...o.sunT),e.uSkyIrr.value.setRGB(o.irr[0]/Math.PI,o.irr[1]/Math.PI,o.irr[2]/Math.PI),e.uMoonLight.value.setRGB(...a).multiplyScalar(o.moonE),e.uNight.value=o.night,e.uCloud.value=o.cloud},update(o,a){e.uTime.value=o,n.position.copy(a.position)}}}function Ip(i){let e=0,t=0;for(let c of i)e+=c.attributes.position.count,t+=c.index.count;let n=new Float32Array(e*3),s=new Float32Array(e*3),r=new Uint32Array(t),o=0,a=0;for(let c of i){n.set(c.attributes.position.array,o*3),s.set(c.attributes.normal.array,o*3);for(let u=0;u<c.index.count;u++)r[a+u]=c.index.array[u]+o;o+=c.attributes.position.count,a+=c.index.count,c.dispose()}let l=new ft;return l.setAttribute("position",new Ze(n,3)),l.setAttribute("normal",new Ze(s,3)),l.setIndex(new Ze(r,1)),l.computeBoundingSphere(),l}var Dp=(i,e,t,n,s,r,o)=>{let a=new $n(i,14,9);return a.scale(e,t,n),a.translate(s,r,o),a};function Lp(i,e=10,t=3){let n=Pn(t),s=new at;s.name="clouds";let r=[_t(i,16777215,{rim:0}),_t(i,16777215,{rim:0}),_t(i,16777215,{rim:0})],o=[];for(let a=0;a<e;a++){let l=5+Math.floor(n()*4),c=14+n()*20,u=[];for(let x=0;x<l;x++){let p=l>1?(x/(l-1)-.5)*2:0,m=(.5+.5*Math.cos(p*1.4))*c*(.3+n()*.12);u.push(Dp(m,1.25,.72+n()*.2,1,p*c*.62,m*.18+n()*2,(n()-.5)*c*.32))}let h=new $e(Ip(u),r[a%3]);h.castShadow=!1,h.receiveShadow=!1;let f=n()*Math.PI*2,d=180+n()*520;h.position.set(Math.cos(f)*d,120+n()*150,Math.sin(f)*d*.8),h.rotation.y=n()*Math.PI*2;let g=.8+n()*1.1;h.scale.set(g,g,g),s.add(h),o.push({node:h,speed:.8+n()*1.2})}return{group:s,applyPalette(a){r[0].uniforms.uColor.value.setRGB(...a.cloud).convertSRGBToLinear(),r[1].uniforms.uColor.value.setRGB(...a.cloud).convertSRGBToLinear().multiplyScalar(.93),r[2].uniforms.uColor.value.setRGB(...a.cloudShade).convertSRGBToLinear()},update(a){for(let l of o)l.node.position.x+=l.speed*a,l.node.position.x>900&&(l.node.position.x=-900)}}}function Fp(i){let e=[{x:-520,z:-260,rot:.5,hills:[[0,0,130,46,70],[60,30,70,30,48],[-80,-20,48,26,40]]},{x:430,z:390,rot:-.4,hills:[[0,0,170,64,80],[110,-30,90,36,60]]},{x:60,z:600,rot:.1,hills:[[0,0,120,30,70]]}],t=[];for(let o of e)for(let[a,l,c,u,h]of o.hills){let f=Dp(1,c,u,h,a,-u*.45,l);f.rotateY(o.rot),f.translate(o.x,0,o.z),t.push(f)}let n=_t(i,7312288,{rim:0,pbr:"far"}),s=new $e(Ip(t),n);s.name="farIslands",s.castShadow=!1,s.receiveShadow=!1;let r=new we;return{mesh:s,applyPalette(o){n.uniforms.uColor.value.setRGB(...o.seaShallow).convertSRGBToLinear().lerp(r.setRGB(...o.ink).convertSRGBToLinear(),.4)}}}function Np(i,e=0){let t=new Lt(512,512,{type:$t,depthBuffer:!0});t.texture.name="sea.reflection";let n=new Qt,s=new D(0,1,0),r=new qe,o=new D,a=new qe,l=new D,c=new D,u=new D,h=new An(s.clone(),-e),f=new An,d=new mt,g=new D(0,e,0);return{texture:t.texture,textureMatrix:r,virtualCamera:n,enabled:!0,setSize(p){t.setSize(p,p)},update(p,m,y=[]){if(o.setFromMatrixPosition(m.matrixWorld),u.subVectors(g,o),u.dot(s)>0)return!1;a.extractRotation(m.matrixWorld),l.set(0,0,-1).applyMatrix4(a).add(o),u.reflect(s).negate().add(o),c.subVectors(g,l).reflect(s).negate().add(g),n.position.copy(u),n.up.set(0,1,0).applyMatrix4(a).reflect(s),n.lookAt(c),n.far=m.far,n.updateMatrixWorld(),n.projectionMatrix.copy(m.projectionMatrix),r.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),r.multiply(n.projectionMatrix).multiply(n.matrixWorldInverse),f.copy(h).applyMatrix4(n.matrixWorldInverse);let _=new mt(f.normal.x,f.normal.y,f.normal.z,f.constant),v=n.projectionMatrix;d.x=(Math.sign(_.x)+v.elements[8])/v.elements[0],d.y=(Math.sign(_.y)+v.elements[9])/v.elements[5],d.z=-1,d.w=(1+v.elements[10])/v.elements[14],_.multiplyScalar(2/_.dot(d)),v.elements[2]=_.x,v.elements[6]=_.y,v.elements[10]=_.z+1-.003,v.elements[14]=_.w;let w=[];for(let b of y)b&&b.visible&&(b.visible=!1,w.push(b));let S=i.getRenderTarget(),E=i.xr.enabled,A=i.shadowMap.autoUpdate;i.xr.enabled=!1,i.shadowMap.autoUpdate=!1,i.setRenderTarget(t),i.state.buffers.depth.setMask(!0),i.autoClear===!1&&i.clear(),i.render(p,n),i.setRenderTarget(S),i.xr.enabled=E,i.shadowMap.autoUpdate=A;for(let b of w)b.visible=!0;return!0},dispose(){t.dispose()}}}var Lh=5,Op=Object.freeze([[.2,27,18,0],[.13,15,64,1.3],[.075,8.2,-28,2.1],[.045,4.6,112,.6],[.03,2.6,38,3]]),N_=9.81,Fh=Op.map(([i,e,t,n])=>({A:i,k:2*Math.PI/e,w:Math.sqrt(N_*(2*Math.PI)/e)*.8,dx:Math.cos(t*ni),dz:Math.sin(t*ni),ph:n})),U_=Op.reduce((i,e)=>i+e[0],0),O_=i=>{let e=Math.min(1,Math.max(0,i/2.2));return e*e*(3-2*e)};function Vr(i,e,t,n=8){let s=O_(n),r=0;for(let o of Fh)r+=o.A*s*Math.sin(o.k*(o.dx*i+o.dz*e)-o.w*t+o.ph);return r}var B_=`
attribute float aDepth;
uniform vec4 uWaveA[ ${Lh} ];      // x \u632F\u5E45 y \u6CE2\u6570 z \u89D2\u9891\u7387 w \u76F8\u4F4D
uniform vec2 uWaveD[ ${Lh} ];
uniform float uTime, uAmp;
varying vec3 vWorld;
varying vec3 vN;
varying float vDepth;
varying float vH;
varying float vViewZ;
void main() {
  vec3 p = position;
  float att = smoothstep( 0.0, 2.2, aDepth ) * uAmp;
  float h = 0.0; vec2 slope = vec2( 0.0 ); vec2 dxz = vec2( 0.0 );
  for ( int i = 0; i < ${Lh}; i ++ ) {
    float th = uWaveA[ i ].y * dot( uWaveD[ i ], p.xz ) - uWaveA[ i ].z * uTime + uWaveA[ i ].w;
    float A = uWaveA[ i ].x * att, c = cos( th );
    h += A * sin( th );
    slope += uWaveD[ i ] * ( A * uWaveA[ i ].y * c );
    dxz += uWaveD[ i ] * ( A * 0.35 * c );
  }
  p.x += dxz.x; p.z += dxz.y; p.y += h;
  vN = normalize( vec3( - slope.x, 1.0, - slope.y ) );
  vWorld = p; vDepth = aDepth; vH = h;
  vec4 mv = modelViewMatrix * vec4( p, 1.0 );
  vViewZ = - mv.z;
  gl_Position = projectionMatrix * mv;
}
`,k_=`
uniform vec3 uDeep, uShallow, uFoam, uSpec, uSand, uSunDir, uGlitDir, uLitTint, uShadeTint, uFogColor, uPaper, uInk;
uniform float uTime, uFogNear, uFogFar, uGlitter, uMaxH, uStyle, uMode, uAmp;
// \u2014\u2014 \u5199\u5B9E \u2014\u2014
uniform sampler2D uSkyTex, uWaterN, uRefl, uNoiseTex;
uniform mat4 uReflMatrix;
uniform float uHasRefl, uFogDensity, uFogMist, uGlitterBoost;
uniform vec3 uKeyDir, uKeyCol, uSkyIrr, uDeepL, uShallowL, uFogL, uFogSunL, uFogSunDir;
varying vec3 vWorld;
varying vec3 vN;
varying float vDepth;
varying float vH;
varying float vViewZ;
${xc}
float hash2( vec2 p ) { return fract( sin( dot( p, vec2( 127.1, 311.7 ) ) ) * 43758.5453 ); }
float vnoise( vec2 p ) {
  vec2 i = floor( p ), f = fract( p ); f = f * f * ( 3.0 - 2.0 * f );
  return mix( mix( hash2( i ), hash2( i + vec2( 1.0, 0.0 ) ), f.x ), mix( hash2( i + vec2( 0.0, 1.0 ) ), hash2( i + vec2( 1.0, 1.0 ) ), f.x ), f.y );
}
// \u5199\u5B9E\u6D77\u9762\uFF1A\u4E24\u5C42\u6EDA\u52A8\u7684\u6C34\u9762\u6CD5\u7EBF\uFF1B\u53CD\u5C04 = \u5929\u7A7A\u70D8\u7119\u56FE\uFF08\u8FDC\u5904\uFF09/ \u955C\u50CF\u76F8\u673A\u753B\u51FA\u6765\u7684\u5012\u5F71\uFF08\u8FD1\u5904\uFF09\uFF1B\u83F2\u6D85\u5C14\u51B3\u5B9A\u53CD\u5C04\u4E0E\u6C34\u8272\u7684\u6BD4\u4F8B
vec3 realSea( vec3 N0, vec3 V, float dist ) {
  vec2 p = vWorld.xz;
  float det = exp( - dist * 0.03 );
  vec3 n1 = texture2D( uWaterN, p * 0.19 + vec2( uTime * 0.010, uTime * 0.007 ) ).xyz * 2.0 - 1.0;
  vec3 n2 = texture2D( uWaterN, p * 0.63 + vec2( - uTime * 0.017, uTime * 0.023 ) ).xyz * 2.0 - 1.0;
  vec2 rip = ( n1.xy * 0.5 + n2.xy * 0.3 * ( 0.3 + 0.7 * det ) ) * uAmp;
  vec3 Nw = normalize( N0 + vec3( rip.x, 0.0, rip.y ) * mix( 0.5, 1.0, det ) );
  float ndv = max( dot( Nw, V ), 0.0 );
  float F = 0.02 + 0.98 * pow( 1.0 - ndv, 5.0 );
  vec3 R = reflect( - V, Nw );
  R.y = max( R.y, 0.012 );
  vec3 refl = texture2D( uSkyTex, equirectUv2( R ) ).rgb;
  if ( uHasRefl > 0.5 ) {
    vec4 rc = uReflMatrix * vec4( vWorld, 1.0 );
    vec2 ruv = rc.xy / rc.w + Nw.xz * 0.11 * clamp( 5.0 / dist, 0.2, 1.0 );
    refl = mix( refl, texture2D( uRefl, clamp( ruv, 0.003, 0.997 ) ).rgb, clamp( 70.0 / dist, 0.0, 1.0 ) );
  }
  // \u6C34\u4F53\uFF1A\u6D45\u5904\u900F\u51FA\u6C99\u5E95\u7684\u9752\u7EFF\uFF0C\u6DF1\u5904\u662F\u5438\u6536\u540E\u7684\u6DF1\u84DD\uFF1B\u7531\u5929\u5149\u4E0E\u4E3B\u5149\uFF08\u592A\u9633\u6216\u6708\u4EAE\uFF09\u7167\u4EAE
  vec3 body = mix( uShallowL, uDeepL, smoothstep( 0.3, 5.5, vDepth ) );
  vec3 light = uSkyIrr + uKeyCol * 0.2 * max( uKeyDir.y, 0.0 );
  float crest = smoothstep( 0.35, 0.9, vH / uMaxH );
  vec3 col = mix( body * light * ( 1.0 + 0.6 * crest ), refl, F );
  // \u7CB2\u5149\uFF1AGGX \u9AD8\u5149\u3002\u7C97\u7CD9\u5EA6\u968F\u8DDD\u79BB\u53D8\u5927\uFF0C\u8FDC\u5904\u7684\u9AD8\u5149\u5E26\u624D\u4E0D\u4F1A\u95EA\u70C1
  vec3 H = normalize( uKeyDir + V );
  float ndh = max( dot( Nw, H ), 0.0 ), a = 0.09 + 0.12 * ( 1.0 - det ), a2 = a * a;
  float D = a2 / ( 3.14159 * pow( ndh * ndh * ( a2 - 1.0 ) + 1.0, 2.0 ) );
  col += uKeyCol * uGlitterBoost * min( D * 0.5, 30.0 ) * F * ( 0.25 + 0.75 * det ) / max( 4.0 * ndv, 0.08 );
  // \u5CB8\u6CAB\uFF1A\u4E24\u6761\u5411\u5CB8\u63A8\u8FDB\u7684\u788E\u6D6A\u7EBF + \u7D27\u8D34\u5CB8\u7EBF\u7684\u767D\u8FB9\uFF0C\u518D\u7528\u566A\u58F0\u6253\u788E
  float fn = vnoise( vWorld.xz * 0.22 + vec2( 0.0, uTime * 0.03 ) );
  float band = fract( vDepth * 1.25 - uTime * 0.42 + fn * 0.9 );
  float shore = 1.0 - smoothstep( 0.9, 2.6, vDepth );
  float foam = smoothstep( 0.80, 0.84, band ) * smoothstep( 0.10, 0.35, vDepth ) * shore;
  foam = max( foam, 1.0 - smoothstep( 0.0, 0.16, vDepth ) );
  foam = max( foam, step( 0.93, fn ) * ( 1.0 - smoothstep( 0.2, 1.2, vDepth ) ) * 0.6 );
  float fl = texture2D( uNoiseTex, vWorld.xz * 0.8 + vec2( uTime * 0.04, - uTime * 0.03 ) ).b;
  foam *= clamp( 0.35 + fl * 2.2 + foam * 0.6, 0.0, 1.0 );
  col = mix( col, ( uSkyIrr + uKeyCol * 0.2 ) * 0.9, clamp( foam, 0.0, 1.0 ) );
  // \u5927\u6C14\u900F\u89C6\u96FE\uFF1A\u4E0E\u5B9E\u4F53\u6750\u8D28\u540C\u4E00\u4E2A\u516C\u5F0F
  float fd = uFogDensity * ( 1.0 + uFogMist * exp( - max( vWorld.y, 0.0 ) / 7.0 ) );
  float f = 1.0 - exp( - fd * fd * vViewZ * vViewZ );
  vec3 fv = vWorld - cameraPosition; fv.y = 0.0;
  col = mix( col, mix( uFogL, uFogSunL, pow( max( dot( normalize( fv ), uFogSunDir ), 0.0 ), 5.0 ) ), f );
  return col;
}
void main() {
  vec3 N = normalize( vN );
  vec3 V = normalize( cameraPosition - vWorld );
  float dist = length( cameraPosition - vWorld );
  if ( uMode > 0.5 ) { gl_FragColor = vec4( realSea( N, V, dist ), 1.0 ); return; }
  // \u7EC6\u788E\u6D9F\u6F2A\uFF1A\u7EAF\u89C6\u89C9\u7684\u9AD8\u9891\u6CD5\u7EBF\u6270\u52A8\uFF0C\u968F\u8DDD\u79BB\u8870\u51CF\u4EE5\u514D\u8FDC\u5904\u95EA\u70C1
  float rip = exp( - dist * 0.012 );
  vec2 q = vWorld.xz * 1.7;
  float n1 = vnoise( q + vec2( uTime * 0.35, uTime * 0.2 ) ), n2 = vnoise( q * 1.3 - vec2( uTime * 0.3, uTime * 0.42 ) );
  N = normalize( N + vec3( ( n1 - 0.5 ) * 0.24 * rip, 0.0, ( n2 - 0.5 ) * 0.24 * rip ) );
  float ndl = dot( N, uSunDir );
  float lit = smoothstep( - 0.02, 0.04, ndl );
  vec3 base = mix( uShallow, uDeep, smoothstep( 0.5, 6.5, vDepth ) );
  base = mix( uSand, base, smoothstep( 0.02, 0.55, vDepth ) );                 // \u6781\u6D45\u5904\u900F\u51FA\u6C99\u5E95
  vec3 col = mix( base * uShadeTint, base * uLitTint, lit );
  col = mix( col, col * 1.10 + uFoam * 0.05, smoothstep( 0.55, 0.85, vH / uMaxH ) );   // \u6CE2\u5CF0\u63D0\u4EAE\u4E00\u6863
  // \u5CB8\u6CAB\uFF1A\u4E24\u6761\u5411\u5CB8\u63A8\u8FDB\u7684\u788E\u6D6A\u7EBF + \u7D27\u8D34\u5CB8\u7EBF\u7684\u767D\u8FB9
  float fn = vnoise( vWorld.xz * 0.22 + vec2( 0.0, uTime * 0.03 ) );
  float band = fract( vDepth * 1.25 - uTime * 0.42 + fn * 0.9 );
  float shore = 1.0 - smoothstep( 0.9, 2.6, vDepth );
  float foam = smoothstep( 0.80, 0.84, band ) * smoothstep( 0.10, 0.35, vDepth ) * shore;
  foam = max( foam, 1.0 - smoothstep( 0.0, 0.16, vDepth ) );
  foam = max( foam, step( 0.93, fn ) * ( 1.0 - smoothstep( 0.2, 1.2, vDepth ) ) * 0.6 );
  col = mix( col, uFoam, clamp( foam, 0.0, 1.0 ) );
  // \u592A\u9633 / \u6708\u5149\u788E\u91D1\uFF1A\u53EA\u5728\u53CD\u5C04\u65B9\u5411\u9644\u8FD1\u7684\u9AD8\u5149\u5E26\u91CC\uFF0C\u6309\u683C\u70B9\u65AD\u6210\u4E00\u683C\u683C\u77ED\u5212
  vec3 R = reflect( - V, N );
  float sg = pow( max( dot( R, uGlitDir ), 0.0 ), 140.0 );
  vec2 gcell = floor( vec2( vWorld.x * 2.4, vWorld.z * 0.7 ) + vec2( 0.0, uTime * 0.6 ) );
  float glint = smoothstep( 0.22, 0.9, sg ) * step( 0.70, hash2( gcell ) ) * ( 0.45 + 0.55 * hash2( gcell + 3.1 ) );
  col = mix( col, uSpec, clamp( glint * 1.7, 0.0, 1.0 ) * uGlitter * rip );
  // \u753B\u98CE\uFF1A\u6392\u7EBF = \u6DE1\u5F69\uFF1B\u7EBF\u7A3F = \u7EB8\u767D\uFF0C\u53EA\u7559\u5CB8\u6CAB\u7684\u58A8\u7EBF
  if ( uStyle > 1.5 ) col = mix( uPaper, uInk, foam * 0.55 );
  else if ( uStyle > 0.5 ) col = mix( col, uPaper, 0.42 );
  col = mix( col, uFogColor, smoothstep( uFogNear, uFogFar, vViewZ ) );
  gl_FragColor = vec4( col, 1.0 );
}
`;function Up(i,e,t,n=1.38,s=3400){let r=Math.max(2,Math.ceil((e-i)/t)),o=[];for(let l=0;l<=r;l++)o.push(i+(e-i)*l/r);let a=(l,c)=>{let u=[],h=t*1.7,f=l;for(;Math.abs(f)<s&&u.length<40;)f+=c*h,u.push(f),h*=n;return u};return[...a(i,-1).reverse(),...o,...a(e,1)]}function Bp(i,e,t={}){let n=e.bounds,s=34,r=t.step??2.6,o=Up(n.minX-s,n.maxX+s,r),a=Up(n.minZ-s,n.maxZ+s,r),l=o.length,c=a.length,u=new Float32Array(l*c*3),h=new Float32Array(l*c),f={};for(let E=0;E<c;E++)for(let A=0;A<l;A++){let b=E*l+A,M=o[A],R=a[E];u[b*3]=M,u[b*3+2]=R;let L=6.5;if(M>n.minX-s&&M<n.maxX+s&&R>n.minZ-s&&R<n.maxZ+s){let U=ii(e,M,R,f);L=Math.min(6.5,Math.max(0,-U))}h[b]=L}let d=new Uint32Array((l-1)*(c-1)*6),g=0;for(let E=0;E<c-1;E++)for(let A=0;A<l-1;A++){let b=E*l+A,M=b+1,R=b+l,L=R+1;d[g++]=b,d[g++]=R,d[g++]=M,d[g++]=M,d[g++]=R,d[g++]=L}let x=new ft;x.setAttribute("position",new Ze(u,3)),x.setAttribute("aDepth",new Ze(h,1)),x.setIndex(new Ze(d,1));let p={uWaveA:{value:Fh.map(E=>new mt(E.A,E.k,E.w,E.ph))},uWaveD:{value:Fh.map(E=>new be(E.dx,E.dz))},uTime:i.uTime,uAmp:{value:1},uDeep:{value:new we},uShallow:{value:new we},uFoam:{value:new we},uSpec:{value:new we},uSand:{value:new we},uSunDir:i.uSunDir,uGlitDir:{value:new D(0,1,0)},uLitTint:i.uLitTint,uShadeTint:i.uShadeTint,uFogColor:i.uFogColor,uFogNear:i.uFogNear,uFogFar:i.uFogFar,uGlitter:{value:.8},uMaxH:{value:U_},uStyle:i.uStyle,uPaper:i.uPaper,uInk:i.uInk,uMode:i.uMode,uSkyTex:{value:null},uWaterN:{value:up()},uRefl:{value:null},uNoiseTex:{value:null},uReflMatrix:{value:new qe},uHasRefl:{value:0},uFogDensity:{value:7e-4},uFogMist:{value:0},uGlitterBoost:{value:1},uKeyDir:{value:new D(0,1,0)},uKeyCol:{value:new we},uSkyIrr:{value:new we},uDeepL:{value:new we(.004,.028,.085)},uShallowL:{value:new we(.06,.42,.4)},uFogL:{value:new we},uFogSunL:{value:new we},uFogSunDir:{value:new D(0,0,-1)}},m=new dt({uniforms:p,vertexShader:B_,fragmentShader:k_}),y=new $e(x,m);y.name="sea",y.frustumCulled=!1,y.castShadow=!1,y.receiveShadow=!1,y.renderOrder=-10;let _=new D,v=null,w=null;return{mesh:y,uniforms:p,applyPalette(E,A,b){p.uDeep.value.setRGB(...E.seaDeep),p.uShallow.value.setRGB(...E.seaShallow),p.uFoam.value.setRGB(...E.seaFoam),p.uSpec.value.setRGB(...E.seaSpec),p.uSand.value.setRGB(...E.sand);let M=A.y>.03;p.uGlitDir.value.copy(M?A:b),p.uGlitter.value=M?Math.min(1,E.sunDisc*.9+.1):E.moon*.7},enableReal(E,A){v=E.K,p.uSkyTex.value=v.sky.texture,p.uNoiseTex.value=v.tex.noise,w=Np(A,0),p.uRefl.value=w.texture,p.uReflMatrix.value=w.textureMatrix},applyReal(E){let A=E.isMoon,b=A?E.moonDir:E.sunDir,M=A?Br.map(R=>R*E.moonE):E.sunT.map(R=>R*E.sunE);p.uKeyDir.value.set(b[0],b[1],b[2]),p.uKeyCol.value.setRGB(M[0],M[1],M[2]),p.uGlitterBoost.value=A?2.6:1,p.uSkyIrr.value.setRGB(E.irr[0]/Math.PI,E.irr[1]/Math.PI,E.irr[2]/Math.PI),p.uFogL.value.setRGB(...E.fog),p.uFogSunL.value.setRGB(...E.fogSun),p.uFogDensity.value=E.fogDensity,p.uFogMist.value=E.mist,v&&p.uFogSunDir.value.copy(v.uni.uFogSunDir.value)},setQuality(E){p.uHasRefl.value=E>=1&&w?1:0,w&&w.setSize([256,512,512][E]),p.uAmp.value=E===0?.85:1},renderReflection(E,A,b){w&&p.uHasRefl.value>.5&&w.update(E,A,b)},setQualityToon(E){p.uAmp.value=E===0?.85:1}}}function Ki(i,e,t,n={}){let s=document.createElement("canvas");s.width=i,s.height=e;let r=s.getContext("2d");t(r,i,e);let o=new as(s);return o.colorSpace=n.data?ti:Kt,o.wrapS=o.wrapT=n.wrap===!1?On:bn,n.repeat&&o.repeat.set(n.repeat[0],n.repeat[1]),o.anisotropy=n.aniso??4,o.generateMipmaps=n.mip??!0,o.minFilter=n.mip===!1?fn:Qn,o}var H_=(i,e)=>{i.fillStyle=e,i.fill()};function kp(i="#ee5f4d",e="#fff3dc",t="#7d2f2a"){return Ki(512,256,(n,s,r)=>{n.fillStyle=i,n.fillRect(0,0,s,r),n.fillStyle=e,n.fillRect(0,0,s*.085,r),n.fillRect(s-s*.085,0,s*.085,r),n.fillStyle=e,n.globalAlpha=.9,n.fillRect(s*.2,0,s*.022,r),n.fillRect(s*.78,0,s*.022,r),n.globalAlpha=1,n.fillStyle=t;for(let o of[.3,.37,.63,.7])for(let[a,l]of[[.1,.36],[.1,.36]])n.beginPath(),n.ellipse(s*o,r*(a+l)/2,s*.016,r*(l-a)/2,0,0,Math.PI*2),H_(n,t);n.beginPath(),n.ellipse(s*.5,r*.13,s*.014,r*.1,0,0,Math.PI*2),n.fillStyle=t,n.fill()},{wrap:!1,aniso:8})}function Hp(i="#d9b27a",e="#ecc78f"){return Ki(256,256,(t,n,s)=>{t.fillStyle="#6f4720",t.fillRect(0,0,n,s);let r=7,o=n/r;for(let a=0;a<r;a++)for(let l=0;l<r;l++){let c=(l+a)%2===0,u=l*o,h=a*o,f=c?e:i;t.fillStyle=f,t.beginPath(),c?t.roundRect(u-o*.1,h+o*.12,o*1.2,o*.76,o*.3):t.roundRect(u+o*.12,h-o*.1,o*.76,o*1.2,o*.3),t.fill(),t.fillStyle="rgba(255,255,255,0.22)",t.beginPath(),c?t.roundRect(u+o*.04,h+o*.2,o*.92,o*.2,o*.1):t.roundRect(u+o*.2,h+o*.04,o*.2,o*.92,o*.1),t.fill(),t.fillStyle="rgba(90,50,15,0.28)",t.beginPath(),c?t.roundRect(u+o*.04,h+o*.66,o*.92,o*.16,o*.08):t.roundRect(u+o*.66,h+o*.04,o*.16,o*.92,o*.08),t.fill()}},{repeat:[1,1],aniso:8})}function zp(i="#5cc3ae",e="#fff3dc"){return Ki(64,512,(t,n,s)=>{t.fillStyle=i,t.fillRect(0,0,n,s),t.fillStyle=e;for(let r of[.8,.88,.955])t.fillRect(0,s*(r-.018),n,s*.036);t.globalAlpha=.1,t.fillStyle="#000";for(let r=0;r<s;r+=6)t.fillRect(0,r,n,2);t.globalAlpha=1})}function Nh(i={}){let e=i.asphalt??"#5f6677",t=i.line??"#fff6dc";return Ki(256,512,(n,s,r)=>{n.fillStyle=e,n.fillRect(0,0,s,r);let o=7,a=()=>(o=o*16807%2147483647,o/2147483647);for(let l=0;l<2600;l++){let c=a();n.fillStyle=c>.5?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.10)",n.fillRect(a()*s,a()*r,1.6,1.6)}n.fillStyle=t,n.fillRect(s*.045,0,s*.022,r),n.fillRect(s*.933,0,s*.022,r),n.fillRect(s*.494,0,s*.012,r*.5)},{repeat:[1,1],aniso:8})}function Vp(i="#e8dfcb",e="#d6cab1"){return Ki(128,128,(t,n,s)=>{t.fillStyle=e,t.fillRect(0,0,n,s);let r=4,o=n/r;for(let a=0;a<r;a++)for(let l=0;l<r;l++){let c=a%2*o*.5;t.fillStyle=(l+a)%3===0?"#dfd4bd":i,t.beginPath(),t.roundRect((l*o+c)%n+1.5,a*o+1.5,o-3,o-3,3),t.fill(),l*o+c+o>n&&(t.beginPath(),t.roundRect(l*o+c-n+1.5,a*o+1.5,o-3,o-3,3),t.fill())}},{repeat:[1,1],aniso:8})}function Gp(i="#c08a55",e="#9c6a3c"){return Ki(128,128,(t,n,s)=>{t.fillStyle=i,t.fillRect(0,0,n,s);for(let r=0;r<5;r++)t.fillStyle=r%2?"#b98350":"#c7915b",t.fillRect(0,r*s/5,n,s/5-3),t.fillStyle=e,t.fillRect(0,r*s/5+s/5-3,n,3);t.globalAlpha=.16,t.fillStyle="#5a3517";for(let r=0;r<22;r++){let o=r*37%s;t.fillRect(r*53%n,o,18+r*7%30,1.2)}t.globalAlpha=1},{repeat:[1,1]})}function Wp(i="#ee5f4d",e="#fff3dc",t=6,n=!0){return Ki(128,128,(s,r,o)=>{s.fillStyle=e,s.fillRect(0,0,r,o),s.fillStyle=i;for(let a=0;a<t;a+=2)n?s.fillRect(a*r/t,0,r/t,o):s.fillRect(0,a*o/t,r,o/t)},{wrap:!1})}var z_=`
  vec4 tuftP = vec4( transformed, 1.0 );
  #ifdef USE_BATCHING
    tuftP = batchingMatrix * tuftP;
  #endif
  #ifdef USE_INSTANCING
    tuftP = instanceMatrix * tuftP;
  #endif
  tuftP = modelMatrix * tuftP;
  float tuftW = uv.y * uv.y;
  float tuftPh = uTime * 1.7 + tuftP.x * 0.31 + tuftP.z * 0.27;
  tuftP.xyz += uWindDir * ( sin( tuftPh ) * 0.7 + sin( tuftPh * 2.3 + 1.0 ) * 0.3 ) * 0.09 * tuftW * uWindStrength;
  vec4 mvPosition = viewMatrix * tuftP;
  gl_Position = projectionMatrix * mvPosition;
`;function Xp(i,e,t={}){let n=Pn(t.seed??517),s=.42,r=.24,o=[],a=[],l=[],c=[];for(let S=0;S<3;S++){let E=S/3*Math.PI,A=Math.cos(E)*s/2,b=Math.sin(E)*s/2,M=S*4;o.push(-A,0,-b,A,0,b,A,r,b,-A,r,-b);for(let R=0;R<4;R++)a.push(0,1,0);l.push(0,0,1,0,1,1,0,1),c.push(M,M+1,M+2,M,M+2,M+3)}let u=new ft;u.setAttribute("position",new ut(o,3)),u.setAttribute("normal",new ut(a,3)),u.setAttribute("uv",new ut(l,2)),u.setIndex(c);let h=new qi({map:vp(),alphaTest:.42,side:Wt,roughness:.88,metalness:0});h.defines={USE_FOG_SUN:""},h.onBeforeCompile=S=>{Object.assign(S.uniforms,e.uni);for(let[E,A]of[["#include <common>",`#include <common>
uniform float uTime; uniform vec3 uWindDir; uniform float uWindStrength;`],["#include <project_vertex>",z_],["#include <normal_fragment_begin>",`#include <normal_fragment_begin>
  normal = normalize( ( viewMatrix * vec4( 0.0, 1.0, 0.0, 0.0 ) ).xyz );`]]){if(!S.vertexShader.includes(E)&&!S.fragmentShader.includes(E))throw new Error("\u8349\u4E1B\u7740\u8272\u5668\u8865\u4E01\u627E\u4E0D\u5230\u951A\u70B9: "+E);S.vertexShader=S.vertexShader.replace(E,A),S.fragmentShader=S.fragmentShader.replace(E,A)}},h.customProgramCacheKey=()=>"pelican-tuft";let f=[],d={},g={},x=Be.half+Be.curbW+Be.walkOut,p=-(Be.half+Be.curbW+Be.walkIn);for(let S=0;S<i.length;S+=.46){i.frameAt(S,d);for(let[E,A,b]of[[x+.3,x+7,1],[p-.25,p-10,2]])for(let M=0;M<b;M++){if(n()<.25)continue;let R=E+(A-E)*n()*n(),L=d.pos[0]+d.right[0]*R,U=d.pos[2]+d.right[2]*R,V=ii(i,L,U,g);jo(g.u,V)===0&&f.push(L,V-.03,U,n()*He,.7+n()*.9,n())}}let m=new Ls(u,h,f.length/6),y=new qe,_=new Ut,v=new D(0,1,0),w=new we;for(let S=0;S<f.length/6;S++){let[E,A,b,M,R,L]=f.slice(S*6,S*6+6);_.setFromAxisAngle(v,M),y.compose(new D(E,A,b),_,new D(R,R*(.75+L*.6),R)),m.setMatrixAt(S,y),m.setColorAt(S,w.setRGB(.75+L*.6,.85+L*.35,.7+L*.3))}return m.instanceMatrix.needsUpdate=!0,m.name="tufts",m.castShadow=!1,m.receiveShadow=!0,m.frustumCulled=!1,m.visible=!1,m.userData.realOnly=!0,{mesh:m,count:f.length/6}}var V_=`
uniform sampler2D tSurfA, tSurfN, tRockA, tRockN, tAltA, tAltN;
uniform float uSurfScale;
uniform vec3 uSurfTint;
#ifdef SURF_BLEND
  varying float vKind;
#endif
// \u7EC6\u8282\u8D34\u56FE \xD7 \u4E24\u4E2A\u5C3A\u5EA6\u7684\u5927\u5C3A\u5EA6\u660E\u6697\u53D8\u5316\uFF08\u6253\u6563\u5E73\u94FA\u611F\uFF09
vec3 surfAlbedo( sampler2D tex, vec3 p, float scale ) {
  return texture2D( tex, p.xz * scale ).rgb
       * mix( vec3( 1.0 ), texture2D( tex, p.xz * scale * 0.143 + 0.37 ).rgb * 1.9, 0.45 )
       * mix( vec3( 1.0 ), texture2D( tex, p.zx * scale * 0.051 + 0.61 ).rgb * 1.9, 0.5 );
}
// \u4E24\u5C42\u7EC6\u8282\u6CD5\u7EBF\uFF08\u8D34\u56FE\u7684 +v \u5BF9\u5E94\u4E16\u754C +z\uFF09\uFF0C\u8FD4\u56DE xy \u504F\u79FB
vec2 surfNormal( sampler2D tex, vec3 p, float scale ) {
  vec2 tA = texture2D( tex, p.xz * scale ).xy * 2.0 - 1.0;
  vec2 tB = texture2D( tex, p.xz * scale * 0.317 + 0.21 ).xy * 2.0 - 1.0;
  return tA + tB * 0.6;
}
`,G_=`
vec3 sN = inverseTransformDirection( vNormal, viewMatrix );
vec3 sP = vFogWorld;
vec3 sAlb = surfAlbedo( tSurfA, sP, uSurfScale );
vec2 sNxy = surfNormal( tSurfN, sP, uSurfScale );
float sRockW = 0.0;
vec2 rUv = vec2( 0.0 );
#if SURF_BLEND
  sAlb = mix( sAlb, surfAlbedo( tAltA, sP, uSurfScale * 0.9 ), vKind );
  sNxy = mix( sNxy, surfNormal( tAltN, sP, uSurfScale * 0.9 ), vKind );
#endif
#if SURF_ROCK
  sRockW = smoothstep( 0.24, 0.5, 1.0 - clamp( sN.y, 0.0, 1.0 ) );
  rUv = ( abs( sN.x ) > abs( sN.z ) ? sP.zy : sP.xy ) * 0.35;
  sAlb = mix( sAlb, texture2D( tRockA, rUv ).rgb * mix( vec3( 1.0 ), texture2D( tRockA, rUv * 0.19 ).rgb * 1.9, 0.5 ), sRockW );
#endif
diffuseColor.rgb *= sAlb * uSurfTint;
`,W_=`
{
  vec3 sP = vFogWorld;
  float sDet = 0.5 + 0.5 * exp( - length( vViewPosition ) * 0.045 );
  vec3 sBump = vec3( sNxy.x, 0.0, sNxy.y ) * 0.24 * sDet;
  #if SURF_ROCK
    if ( sRockW > 0.001 ) {
      vec2 rN = texture2D( tRockN, rUv ).xy * 2.0 - 1.0;
      sBump = mix( sBump, ( abs( sN.x ) > abs( sN.z ) ? vec3( 0.0, rN.y * 0.5, rN.x * 0.5 ) : vec3( rN.x * 0.5, rN.y * 0.5, 0.0 ) ), sRockW );
    }
  #endif
  normal = normalize( ( viewMatrix * vec4( normalize( sN + sBump ), 0.0 ) ).xyz );
}
`;function Uh(i,e){let t=new qi({vertexColors:!!e.vertexColors,roughness:e.rough??.95,metalness:0,side:e.doubleSide?Wt:xn});return t.defines={USE_FOG_SUN:"",SURF_ROCK:e.rock?1:0,SURF_BLEND:e.blend?1:0},t.onBeforeCompile=n=>{Object.assign(n.uniforms,i.uni,{tSurfA:{value:e.ground.albedo},tSurfN:{value:e.ground.normal},tRockA:{value:e.rock?.albedo??null},tRockN:{value:e.rock?.normal??null},tAltA:{value:e.alt?.albedo??null},tAltN:{value:e.alt?.normal??null},uSurfScale:{value:e.scale??.5},uSurfTint:{value:new we(e.tint??16777215)}});for(let[s,r]of[["#include <common>",`#include <common>
`+V_],["#include <map_fragment>",G_],["#include <normal_fragment_maps>",`#include <normal_fragment_maps>
`+W_]]){if(!n.fragmentShader.includes(s))throw new Error("\u5730\u8868\u6750\u8D28\u8865\u4E01\u627E\u4E0D\u5230\u951A\u70B9: "+s);n.fragmentShader=n.fragmentShader.replace(s,r)}e.blend&&(n.vertexShader=n.vertexShader.replace("#include <common>",`#include <common>
attribute float aKind;
varying float vKind;`).replace("#include <begin_vertex>",`#include <begin_vertex>
vKind = aKind;`))},t.customProgramCacheKey=()=>"pelican-surf"+(e.rock?"-rock":"")+(e.blend?"-blend":""),t}function Oh(i,e,t,n={}){let s=new qi({map:e,normalMap:t,roughness:n.rough??.85,metalness:0,normalScale:new be(n.normalScale??.8,n.normalScale??.8)});return n.side!==void 0&&(s.side=n.side),s.defines={USE_FOG_SUN:""},s.onBeforeCompile=r=>Object.assign(r.uniforms,i.uni),s.customProgramCacheKey=()=>"pelican-tex",s}function qp(i,e,t={}){let n=e.bounds,s=30,r=t.step??1.7,o=Math.ceil((n.maxX-n.minX+s*2)/r)+1,a=Math.ceil((n.maxZ-n.minZ+s*2)/r)+1,l=Be.half+Be.curbW+Math.max(Be.walkOut,Be.walkIn),c=new Float32Array(o*a*3),u=new Float32Array(o*a*3),h=new Float32Array(o*a*3),f=new Uint8Array(o*a),d={},g=(K,O)=>c[(Math.min(a-1,Math.max(0,O))*o+Math.min(o-1,Math.max(0,K)))*3+1];for(let K=0;K<a;K++)for(let O=0;O<o;O++){let j=K*o+O,J=n.minX-s+O*r,F=n.minZ-s+K*r,ie=ii(e,J,F,d);Math.abs(d.u)<=Be.half?ie-=.05:Math.abs(d.u)<=l&&(ie=d.y-.04),c[j*3]=J,c[j*3+1]=ie,c[j*3+2]=F;let pe=jo(d.u,ie);f[j]=pe===1?1:pe>=2?2:0;let ge=fc(J*.022,F*.022,4),oe=fc(J*.6,F*.6,6)*.5+.5,Z=.9+.045*ge+.07*oe;h[j*3]=Z*(1+.1*ge),h[j*3+1]=Z,h[j*3+2]=Z*(1-.14*ge)}for(let K=0;K<a;K++)for(let O=0;O<o;O++){let j=K*o+O,J=g(O-1,K)-g(O+1,K),F=g(O,K-1)-g(O,K+1),ie=Math.hypot(J,2*r,F);u[j*3]=J/ie,u[j*3+1]=2*r/ie,u[j*3+2]=F/ie}let x=[[],[],[]],p=[new Set,new Set,new Set],m={};for(let K=0;K<a-1;K++)for(let O=0;O<o-1;O++){let j=K*o+O,J=j+1,F=j+o,ie=F+1;if(Math.max(c[j*3+1],c[J*3+1],c[F*3+1],c[ie*3+1])<-1.7)continue;let ge=[f[j],f[J],f[F],f[ie]],oe=ge.includes(1)&&!ge.includes(0)?1:0;if(ge.includes(2)||jo(m.u,ii(e,(c[j*3]+c[J*3]+c[F*3]+c[ie*3])/4,(c[j*3+2]+c[J*3+2]+c[F*3+2]+c[ie*3+2])/4,m))>=2){let Z=ge.find(ee=>ee!==2);oe=Z!==void 0?Z:m.u<0?0:1}x[oe].push(j,F,J,J,F,ie);for(let Z of[j,J,F,ie])p[oe].add(Z)}let y=[_t(i,8176747,{vertexColors:!0,rim:.5}),_t(i,15718823,{vertexColors:!0,rim:.5}),_t(i,10134426,{vertexColors:!0,rim:.3})],_=new at;_.name="terrain";let v=["terrainGrass","terrainSand","terrainUnder"],w={};x.forEach((K,O)=>{if(!K.length)return;let j=[...p[O]],J=new Map;j.forEach((Z,ee)=>J.set(Z,ee));let F=new Float32Array(j.length*3),ie=new Float32Array(j.length*3),pe=new Float32Array(j.length*3);j.forEach((Z,ee)=>{F.set(c.subarray(Z*3,Z*3+3),ee*3),ie.set(h.subarray(Z*3,Z*3+3),ee*3),pe.set(u.subarray(Z*3,Z*3+3),ee*3)});let ge=new ft;ge.setAttribute("position",new Ze(F,3)),ge.setAttribute("color",new Ze(ie,3)),ge.setAttribute("normal",new Ze(pe,3)),ge.setIndex(K.map(Z=>J.get(Z))),ge.computeBoundingSphere();let oe=new $e(ge,y[O]);oe.name=v[O],oe.castShadow=!1,oe.receiveShadow=!0,_.add(oe),w[v[O]]=oe});let S={};function E(K,O,j,J,F=1,ie=!1){let pe=Math.ceil(e.length/J)+1,ge=new Float32Array(pe*2*3),oe=new Float32Array(pe*2*2),Z=new Float32Array(pe*2*3);for(let Te=0;Te<pe;Te++){let Ae=Math.min(Te*J,e.length);e.frameAt(Ae,S);for(let[Re,N]of[[0,K],[1,O]]){let fe=ie?.05*(1-(N/Be.half)**2):0,le=(Te*2+Re)*3;ge[le]=S.pos[0]+S.right[0]*N,ge[le+1]=S.pos[1]+fe+j,ge[le+2]=S.pos[2]+S.right[2]*N,oe[(Te*2+Re)*2]=Re,oe[(Te*2+Re)*2+1]=Ae/F,Z[le+1]=1}}let ee=new Uint32Array((pe-1)*6),ye=0;for(let Te=0;Te<pe-1;Te++){let Ae=Te*2,Re=Ae+1,N=Ae+2,fe=Ae+3;ee[ye++]=Ae,ee[ye++]=Re,ee[ye++]=N,ee[ye++]=Re,ee[ye++]=fe,ee[ye++]=N}let Ee=new ft;return Ee.setAttribute("position",new Ze(ge,3)),Ee.setAttribute("normal",new Ze(Z,3)),Ee.setAttribute("uv",new Ze(oe,2)),Ee.setIndex(new Ze(ee,1)),Ee.computeBoundingSphere(),Ee}let A=(K,O,j={})=>{let J=new $e(K,_t(i,O,{...j}));return J.receiveShadow=!0,J.castShadow=!1,_.add(J),J},b=_t(i,16777215,{map:Nh(),spec:.08,specSize:.9,rim:.25});b.uniforms.uMap.value.repeat.set(1,1);let M=new $e(E(-Be.half,Be.half,0,1.5,9,!0),b);M.name="road",M.receiveShadow=!0,_.add(M);let R=Be.half+Be.curbW,L=[];for(let[K,O,j]of[["walkSea",R,R+Be.walkOut],["walkLand",-R-Be.walkIn,-R]]){let J=E(O,j,Be.curbH,2,3.3),F=_t(i,16777215,{map:Vp(),spec:.08,specSize:.9,rim:.3});L.push(F);let ie=new $e(J,F);ie.name=K,ie.receiveShadow=!0,_.add(ie)}let U=[];for(let K of[1,-1]){let O=new ft,j=2,J=Math.ceil(e.length/j)+1,F=new Float32Array(J*2*3);for(let Z=0;Z<J;Z++){let ee=Math.min(Z*j,e.length);e.frameAt(ee,S);let ye=K*Be.half;F.set([S.pos[0]+S.right[0]*ye,S.pos[1]-.02,S.pos[2]+S.right[2]*ye],Z*2*3),F.set([S.pos[0]+S.right[0]*ye,S.pos[1]+Be.curbH+.002,S.pos[2]+S.right[2]*ye],(Z*2+1)*3)}let ie=new Uint32Array((J-1)*6),pe=0;for(let Z=0;Z<J-1;Z++){let ee=Z*2,ye=ee+1,Ee=ee+2,Te=ee+3;K>0?ie.set([ee,Ee,ye,ye,Ee,Te],pe):ie.set([ee,ye,Ee,ye,Te,Ee],pe),pe+=6}O.setAttribute("position",new Ze(F,3)),O.setIndex(new Ze(ie,1)),O.computeVertexNormals(),O.computeBoundingSphere();let ge=_t(i,15327954,{side:Wt,spec:.1,rim:.3});U.push(ge);let oe=new $e(O,ge);oe.name="curb"+(K>0?"Sea":"Land"),oe.receiveShadow=!0,_.add(oe)}for(let[K,O,j]of[["curbTopSea",Be.half,R],["curbTopLand",-R,-Be.half]]){let J=new $e(E(O,j,Be.curbH+.004,1.5,1.5),U[0]);J.name=K,J.receiveShadow=!0,_.add(J)}let V=[];function X(K,O,j,J){let ie=new Float32Array(282),pe=new Uint32Array(276),ge=O.x-K.x,oe=O.z-K.z,Z=Math.hypot(ge,oe),ee=-oe/Z,ye=ge/Z;for(let Re=0;Re<=46;Re++){let N=Re/46,fe=Math.sin(N*Math.PI)*Z*.08,le=K.x+ge*N+ee*fe,ce=K.z+oe*N+ye*fe;for(let[de,Y]of[[0,-1],[1,1]]){let G=le+ee*Y*j/2,H=ce+ye*Y*j/2,se=(Re*2+de)*3;ie[se]=G,ie[se+1]=ii(e,G,H)+.04,ie[se+2]=H}}for(let Re=0;Re<46;Re++){let N=Re*2,fe=N+1,le=N+2,ce=N+3;pe.set([N,le,fe,fe,le,ce],Re*6)}let Ee=new ft;Ee.setAttribute("position",new Ze(ie,3)),Ee.setIndex(new Ze(pe,1)),Ee.computeVertexNormals(),Ee.computeBoundingSphere();let Te=_t(i,J,{side:Wt,rim:.2});V.push(Te);let Ae=new $e(Ee,Te);return Ae.receiveShadow=!0,Ae.name="dirtPath",_.add(Ae),{from:new D(K.x,0,K.z),dir:new D(ee,0,ye),len:Z}}let $=null;return{group:_,dirtPath:X,meshes:w,applyPalette(K){y[0].uniforms.uColor.value.setRGB(...K.grass).convertSRGBToLinear(),y[1].uniforms.uColor.value.setRGB(...K.sand).convertSRGBToLinear(),y[2].uniforms.uColor.value.setRGB(...K.sand).convertSRGBToLinear().multiplyScalar(.86)},enableReal(K){let O=K.K,j=hp(),J=fp(),F=dp(),ie=pp(),pe={grass:Uh(O,{ground:j,rock:F,vertexColors:!0,rough:.97,scale:.5}),sand:Uh(O,{ground:J,vertexColors:!0,rough:.92,scale:.45}),road:Oh(O,Nh({asphalt:"#2c2e33",line:"#cfc6ae"}),ie,{rough:.93,normalScale:.22}),walk:Oh(O,mp(),gp(192,6),{rough:.84,normalScale:.5}),curb:Oh(O,null,ie,{rough:.86,side:Wt,normalScale:.2}),path:Uh(O,{ground:J,scale:.6,rough:.95,tint:10521186,doubleSide:!0})};pe.curb.color.set(10262412);for(let[ge,oe]of[[0,"grass"],[1,"sand"]])y[ge].userData.pbrOverride=pe[oe];b.userData.pbrOverride=pe.road;for(let ge of L)ge.userData.pbrOverride=pe.walk;for(let ge of U)ge.userData.pbrOverride=pe.curb;for(let ge of V)ge.userData.pbrOverride=pe.path;return $=Xp(e,O),_.add($.mesh),K.postHide.push($.mesh),pe},get tufts(){return $}}}var Bh=[new D(1,0,0),new D(0,1,0),new D(0,0,1)],kh={u:0,v:0},$i=class{constructor(e={}){this.rings=e.rings??28,this.radial=e.radial??22;let t=e.caps??[!0,!0];this.capStart=!!t[0],this.capEnd=!!t[1],this.tDist=e.tDist??"cos",this.prof=()=>({a:1,bt:1,bb:1,k:.25}),this.section=null;let n=this.rings,s=this.radial,r=(n+1)*s;this.poleStart=r,this.poleEnd=r+(this.capStart?1:0);let o=r+(this.capStart?1:0)+(this.capEnd?1:0);this.count=o,this.pos=new Float32Array(o*3),this.nrm=new Float32Array(o*3),this.uv=new Float32Array(o*2);let a=[];for(let u=0;u<n;u++)for(let h=0;h<s;h++){let f=u*s+h,d=u*s+(h+1)%s,g=(u+1)*s+h,x=(u+1)*s+(h+1)%s;a.push(f,d,g,d,x,g)}if(this.capStart)for(let u=0;u<s;u++)a.push(this.poleStart,(u+1)%s,u);if(this.capEnd)for(let u=0;u<s;u++)a.push(this.poleEnd,n*s+u,n*s+(u+1)%s);let l=new ft;l.setAttribute("position",new Ze(this.pos,3).setUsage(Yi)),l.setAttribute("normal",new Ze(this.nrm,3).setUsage(Yi)),l.setAttribute("uv",new Ze(this.uv,2)),l.setIndex(o>65535?new Ds(a,1):new Is(a,1)),l.setAttribute("aOutlineN",l.attributes.normal),l.setAttribute("aOutlineW",new Ze(new Float32Array(o).fill(1),1));for(let u=0;u<=n;u++)for(let h=0;h<s;h++)this.uv[(u*s+h)*2]=h/s;this.geometry=l;let c=()=>Array.from({length:n+1},()=>new D);this.C=c(),this.T=c(),this.N=c(),this.B=c(),this._axis=new D,this._tmp=new D,this.ts=new Float32Array(n+1);for(let u=0;u<=n;u++){let h=u/n;this.ts[u]=this.tDist==="cos"?.5*(1-Math.cos(Math.PI*h)):h}}setProfile(e){return this.prof=typeof e=="function"?e:()=>e,this}setSection(e){return this.section=e,this}update(e,t){let n=this.rings,s=this.radial,r=this.C,o=this.T,a=this.N,l=this.B;for(let S=0;S<=n;S++)e(this.ts[S],r[S]);for(let S=0;S<=n;S++)o[S].subVectors(r[Math.min(S+1,n)],r[Math.max(S-1,0)]),o[S].lengthSq()<1e-16&&o[S].copy(S>0?o[S-1]:Bh[2]),o[S].normalize();let c=t;if(!c){let S=Bh[0],E=1;for(let A of Bh){let b=Math.abs(A.dot(o[0]));b<E&&(E=b,S=A)}c=S}a[0].copy(c).addScaledVector(o[0],-c.dot(o[0])),a[0].lengthSq()<1e-10&&a[0].set(o[0].y,o[0].z,o[0].x).addScaledVector(o[0],-o[0].y*o[0].x-o[0].z*o[0].y-o[0].x*o[0].z),a[0].normalize();let u=this._axis,h=this._tmp;for(let S=1;S<=n;S++){u.crossVectors(o[S-1],o[S]);let E=u.length(),A=wt(o[S-1].dot(o[S]));if(E>1e-9){u.multiplyScalar(1/E);let b=Math.atan2(E,A),M=Math.cos(b),R=Math.sin(b),L=a[S-1];h.crossVectors(u,L),a[S].copy(L).multiplyScalar(M).addScaledVector(h,R).addScaledVector(u,u.dot(L)*(1-M)).normalize()}else a[S].copy(a[S-1])}for(let S=0;S<=n;S++)l[S].crossVectors(o[S],a[S]);let f=this.pos,d=this.uv;for(let S=0;S<=n;S++){let E=this.ts[S],A=r[S],b=a[S],M=l[S],R=this.prof(E),L=R.a??R,U=R.bt??R,V=R.bb??R,X=R.k??.25,$=S*s;for(let K=0;K<s;K++){let O=K/s*He,j,J;if(this.section)this.section(E,O,kh),j=kh.u,J=kh.v;else{let ie=Math.sin(O),pe=Math.cos(O);j=L*pe,J=ie*(V+(U-V)*kn(-X,X,ie))}let F=($+K)*3;f[F]=A.x+b.x*j+M.x*J,f[F+1]=A.y+b.y*j+M.y*J,f[F+2]=A.z+b.z*j+M.z*J,d[($+K)*2+1]=E}}if(this.capStart){let S=this.poleStart*3;f[S]=r[0].x,f[S+1]=r[0].y,f[S+2]=r[0].z}if(this.capEnd){let S=this.poleEnd*3;f[S]=r[n].x,f[S+1]=r[n].y,f[S+2]=r[n].z}let g=this.nrm,x=f,p=(S,E,A)=>{let b;S<0?b=this.poleStart*3:S>n?b=this.poleEnd*3:b=(S*s+(E%s+s)%s)*3,A[0]=x[b],A[1]=x[b+1],A[2]=x[b+2]},m=[0,0,0],y=[0,0,0],_=[0,0,0],v=[0,0,0],w=(S,E,A)=>{S[0]=E[0]-A[0],S[1]=E[1]-A[1],S[2]=E[2]-A[2]};for(let S=0;S<=n;S++)for(let E=0;E<s;E++){p(S,E+1,m),p(S,E-1,y),w(_,m,y),S===0&&!this.capStart?(p(1,E,m),p(0,E,y),w(v,m,y)):S===n&&!this.capEnd?(p(n,E,m),p(n-1,E,y),w(v,m,y)):(p(S+1,E,m),p(S-1,E,y),w(v,m,y));let A=_[1]*v[2]-_[2]*v[1],b=_[2]*v[0]-_[0]*v[2],M=_[0]*v[1]-_[1]*v[0],R=Math.hypot(A,b,M),L=(S*s+E)*3;if(R>1e-12)g[L]=A/R,g[L+1]=b/R,g[L+2]=M/R;else{let U=E/s*He,V=Math.cos(U),X=Math.sin(U);g[L]=a[S].x*V+l[S].x*X,g[L+1]=a[S].y*V+l[S].y*X,g[L+2]=a[S].z*V+l[S].z*X}}if(this.capStart){let S=this.poleStart*3;g[S]=-o[0].x,g[S+1]=-o[0].y,g[S+2]=-o[0].z}if(this.capEnd){let S=this.poleEnd*3;g[S]=o[n].x,g[S+1]=o[n].y,g[S+2]=o[n].z}return this.geometry.attributes.position.needsUpdate=!0,this.geometry.attributes.normal.needsUpdate=!0,this.geometry.computeBoundingSphere(),this}};function di(i,e,t={}){let n=new $i(t);return e&&n.setProfile(e),t.section&&n.setSection(t.section),n.update(i,t.ref),n.geometry}var _e=Object.freeze({white:16183782,cream:15721673,coral:15690325,teal:3112838,wood:12158037,woodLight:13212262,woodDark:9199418,iron:4016725,trunk:12752491,trunkDark:11107410,frond:6077304,frondDark:4629861,bush:7323501,bushDark:5810268,leaf:7652462,coconut:8017206,lampGlass:16773312,navy:2903918,sky:3844041,sun:16237896,stone:14209732,gullGray:9212835,orange:15766076}),Yp=[15887198,16237896,16249315,15240112,16095818],X_=new qe,Zp=new qe,q_=new D,Kp=new Ut,Y_=new en,Z_=new D;function ln(i,e,t,n,s=0){let r=new qe().makeRotationY(s).setPosition(e,t,n),o=(a,l,c={},u=[0,0,0],h=[0,0,0],f=[1,1,1])=>(Kp.setFromEuler(Y_.set(h[0],h[1],h[2])),Zp.compose(q_.set(u[0],u[1],u[2]),Kp,Z_.set(f[0],f[1],f[2])),i.add(a,X_.multiplyMatrices(r,Zp).clone(),l,c),o);return o}function K_(i){let e=i.index.array;for(let t=0;t<e.length;t+=3){let n=e[t+1];e[t+1]=e[t+2],e[t+2]=n}return i.index.needsUpdate=!0,i.computeVertexNormals(),i}function $_(i,e,t,n,s){return new Bn(i,e,t,1,1,!0,s/n*He,He/n)}function $p(i,e,t={}){let n=t.t0??0,s=t.t1??1,r=t.segs??16,o=t.arch??.5,a=t.droop??1.2,l=t.serr??13,c=t.thick??.012,u=r+1,h=[],f=[],d=[],g=v=>e*Math.pow(Math.max(Math.sin(Math.PI*Math.pow(v,.62)),0),.9)*(1-.25*v)*(.78+.22*Math.abs(v*l%1*2-1)),x=v=>o*Math.sin(v*Math.PI*.5)-a*v*v;for(let v=0;v<u;v++){let w=st(n,s,v/r),S=w*i,E=Math.max(g(w),.004),A=x(w);h.push([-E,A+c,S],[E,A+c,S]),f.push([-E,A,S],[E,A,S])}let p=u*2;for(let v=0;v<r;v++){let w=v*2,S=w+1,E=w+2,A=w+3;d.push(w,E,S,S,E,A,p+w,p+S,p+E,p+S,p+A,p+E,w,S,p+w,p+w,S,p+S,E,p+E,A,A,p+E,p+A)}d.push(0,p,1,1,p,p+1);let m=r*2,y=m+1;d.push(m,y,p+m,y,p+y,p+m);let _=new ft;return _.setAttribute("position",new Ze(new Float32Array([...h,...f].flat()),3)),_.setIndex(d),_.computeVertexNormals(),_}function Hh(i,e,t,n,s,r={}){let o=s()*He,a=r.h??5.5+s()*3.5,l=.6+s()*1.1,c=ln(i,e,t-.15,n,o),u=r.blades?ln(r.blades,e,t-.15,n,o):c,h=[.02,.06,.12,.2];for(let x=0;x<4;x++)c(di((p,m)=>{let y=(x+p)/4;m.set(l*y*y,a*y,0)},p=>{let m=(x+p)/4,y=st(.2,.125,m)*(m<.07?1+(.07-m)*10:1);return{a:y,bt:y,bb:y}},{rings:6,radial:12,caps:[x===0,x===3]}),x%2?_e.trunk:_e.trunkDark,{outline:.8,sway:h[x]*.4,phase:o});let f=l,d=a+.05;c(Mt(.27,12,9),_e.trunkDark,{outline:.8,sway:.09,phase:o},[f,d-.06,0]);let g=8+Math.floor(s()*2);for(let x=0;x<g;x++){let p=x/g*He+s()*.3,m=2.4+s()*.9,y=(s()-.5)*.3,_=x%2?_e.frond:_e.frondDark,v=o+x*1.7,w={segs:7,arch:.55,droop:1.3,serr:7};if(u($p(m,.52,{...w,t0:0,t1:.52}),_,{outline:.8,sway:.1,phase:v},[f,d+.1,0],[y,p,0]),u($p(m,.52,{...w,t0:.52,t1:1}),_,{outline:.8,sway:.26,phase:v+.6},[f,d+.1,0],[y,p,0]),r.cards){let S=new qe().makeRotationY(o).setPosition(e,t-.15,n);r.cards.add(J_(m,y,p,f,d+.1),S,_,{sway:.2,phase:v+.4})}}for(let x=0;x<3;x++){let p=s()*He;c(Mt(.14,10,8),_e.coconut,{outline:.8},[f+Math.cos(p)*.2,d-.22,Math.sin(p)*.2])}}function J_(i,e,t,n,s){let l=E=>.55*Math.sin(E*Math.PI*.5)-1.3*E*E,c=new Ut().setFromEuler(new en(e,t,0)),u=[],h=[],f=[],d=[],g=new D,x=new D,p=new D,m=new D,y=new D,_=new D,v=new D,w=E=>{E.applyQuaternion(c).add(m.set(n,s,0)),u.push(E.x,E.y,E.z)};for(let E=0;E<13;E++){let A=.13+.85*(E/12);g.set(0,(l(A+.01)-l(A-.01))/.02,i).normalize();let b=i*(.17+.15*Math.sin(Math.PI*Math.pow(A,.75)));for(let M of[1,-1]){x.set(M*.82,-.16-.3*A,-.46).addScaledVector(g,.5).normalize(),p.crossVectors(x,g).normalize().multiplyScalar(.075),v.crossVectors(p,x).normalize(),y.set(0,l(A),A*i).addScaledVector(g,-.03),_.copy(y).addScaledVector(x,b);let R=u.length/3;w(y.clone().add(p)),w(y.clone().sub(p)),w(_.clone().addScaledVector(p,.3)),w(_.clone().addScaledVector(p,-.3));for(let L=0;L<4;L++)h.push(v.x,v.y,v.z);f.push(0,0,1,0,1,1,0,1),d.push(R,R+1,R+2,R,R+2,R+3)}}let S=new ft;return S.setAttribute("position",new ut(u,3)),S.setAttribute("normal",new ut(h,3)),S.setAttribute("uv",new ut(f,2)),S.setIndex(d),S}function zh(i,e,t,n,s){let r=ln(i,e,t-.1,n,s()*He),o=1.5+s()*.8;r(it(.13,.2,o,10).translate(0,o/2,0),_e.trunkDark,{outline:.9});let a=4+Math.floor(s()*2);for(let l=0;l<a;l++){let c=l/a*He,u=1+s()*.6;r(Mt(u,14,10),l%2?_e.leaf:_e.bushDark,{outline:1,sway:.05,phase:c},[Math.cos(c)*.8,o+.7+s()*.6,Math.sin(c)*.8])}r(Mt(1.35,14,10),_e.leaf,{outline:1,sway:.06},[0,o+1.5,0])}function Vh(i,e,t,n,s,r={}){let o=ln(i,e,t-.08,n,s()*He),a=r.big?1.5:1,l=3+Math.floor(s()*2);for(let c=0;c<l;c++){let u=s()*He,h=(.32+s()*.26)*a;o(Mt(h,12,9),c%2?_e.bush:_e.bushDark,{outline:1},[Math.cos(u)*.3*a,h*.7,Math.sin(u)*.3*a])}}function Jp(i,e,t,n,s){let r=ln(i,e,t,n,0),o=5+Math.floor(s()*5),a=Yp[Math.floor(s()*Yp.length)];for(let l=0;l<o;l++){let c=(s()-.5)*1.4,u=(s()-.5)*1.4,h=.16+s()*.16;r(it(.008,.01,h,5).translate(0,h/2,0),_e.frondDark,{outline:0,sway:.03,phase:l},[c,0,u]),r(Mt(.055+s()*.02,8,6),s()<.7?a:16249315,{outline:.7},[c,h+.03,u])}}function jp(i,e,t,n){let s=t[0]-e[0],r=t[1]-e[1],o=Math.hypot(s,r),a=Math.atan2(s,r),l=ln(i,e[0],n,e[1],a);l(it(.045,.05,1,8).translate(0,.5,0),_e.white,{spec:.3}),l(Mt(.075,10,8),_e.white,{spec:.3},[0,1.03,0]);for(let c of[.52,.95])l(gn([[0,c,0],[0,c,o]],.032,{tubular:1,radial:7}),_e.white,{spec:.3,outline:.8})}function Qp(i,e,t,n,s){let r=ln(i,e,t,n,s);r(it(.16,.2,.12,12).translate(0,.06,0),_e.teal,{outline:.9}),r(it(.05,.075,3.5,10).translate(0,1.8,0),_e.teal,{spec:.3}),r(gn([[0,3.5,0],[0,3.76,.12],[0,3.83,.42],[0,3.73,.62]],.04,{tubular:10,radial:7}),_e.teal,{spec:.3}),r(it(.17,.12,.08,6).translate(0,3.47,.62),_e.teal,{outline:.8}),r(it(.13,.17,.34,6).translate(0,3.26,.62),_e.lampGlass,{lamp:1,spec:.6,specSize:.5}),r(it(.19,.19,.05,6).translate(0,3.07,.62),_e.teal,{outline:.8}),r(Mt(.035,8,6),_e.coral,{spec:.5},[0,3.52,.62])}function e0(i,e,t,n,s){let r=ln(i,e,t,n,s);for(let o of[-.78,.78])r(gn([[o,0,.24],[o,.43,.22],[o,.43,-.16],[o,0,-.2]],.028,{tubular:8,radial:6}),_e.iron,{outline:.8}),r(gn([[o,.43,-.16],[o,.9,-.32]],.026,{tubular:4,radial:6}),_e.iron,{outline:.8});for(let o=0;o<4;o++)r(rt(1.8,.035,.1,.012),o%2?_e.wood:_e.woodLight,{outline:.8},[0,.455,.2-o*.115]);for(let o=0;o<3;o++)r(rt(1.8,.1,.035,.012),_e.wood,{outline:.8},[0,.6+o*.125,-.23-o*.042],[.3,0,0])}function t0(i,e,t,n,s){let r=ln(i,e,t,n,s()*He),o=[(s()-.5)*.35,0,(s()-.5)*.35],a=[[_e.coral,_e.cream],[_e.sky,_e.cream],[_e.sun,_e.cream]],[l,c]=a[Math.floor(s()*3)];r(it(.025,.025,2.3,8).translate(0,1.15,0),_e.cream,{outline:.7},[0,0,0],o);for(let u=0;u<12;u++){let h=$_(.03,1.4,.52,12,u).translate(0,2.04,0);r(h,u%2?l:c,{outline:.9},[0,0,0],o),r(K_(h.clone()),u%2?l:c,{outline:0},[0,0,0],o,[1,1,.985])}if(r(Mt(.05,8,6),_e.wood,{outline:.6},[-Math.sin(o[2])*2.3,2.32,Math.sin(o[0])*2.3]),r(rt(.85,.02,1.7,.01),l===_e.sky?_e.sun:_e.sky,{outline:.6},[.95,.012,.25],[0,.3,0]),s()<.6)for(let u=0;u<6;u++)r(new $n(.2,4,8,u/6*He,He/6),u%2?_e.coral:_e.cream,{outline:.8},[-.9,.2,1.05])}function n0(i,e,t,n,s){let r=ln(i,e,t-.03,n,s()*He),o=15718823;r(it(.55,.65,.35,8).translate(0,.17,0),o,{outline:.8});for(let[a,l,c,u]of[[0,0,.22,.7],[.42,.1,.16,.5],[-.36,-.22,.15,.45]]){r(it(c,c*1.08,u,8).translate(a,u/2+.3,l),o,{outline:.8});for(let h=0;h<8;h++){let f=h/8*He;r(rt(c*.5,.08,c*.5,.005),o,{outline:.6},[a+Math.cos(f)*c*.75,u+.34,l+Math.sin(f)*c*.75],[0,-f,0])}}r(it(.012,.012,.4,5).translate(0,1.2,0),_e.woodDark,{outline:.5}),r(nn([[0,0],[.2,-.05],[0,-.1]],.006,{bevel:0}),_e.coral,{outline:.6},[0,1.38,0])}function i0(i,e,t,n,s){let r=ln(i,e,t,n,s);for(let o of[-1.2,1.2])for(let a of[-1.05,1.05])r(it(.09,.11,2.5,8).translate(o,1.2,a),_e.woodDark,{outline:.9});r(rt(3.2,.14,2.8,.03).translate(0,2.45,0),_e.wood,{outline:1}),r(rt(2.5,2,2.2,.05).translate(0,3.5,-.1),_e.cream,{outline:1}),r(it(.05,2.15,.85,4).rotateY(Math.PI/4).translate(0,4.9,-.1),_e.coral,{outline:1}),r(rt(1.3,.75,.06,.01).translate(0,3.75,1.02),_e.navy,{outline:.8}),r(rt(.06,.75,1.2,.01).translate(1.26,3.75,-.1),_e.navy,{outline:.8}),r(rt(.9,.06,3.6,.02),_e.woodLight,{outline:.9},[1.95,1.22,2.55],[-.79,0,0]);for(let o of[1.55,2.35])r(gn([[o,.95,4.1],[o,2.2,1.95],[o,3.4,1.25]],.03,{tubular:6,radial:6}),_e.white,{outline:.7});r(rt(1.6,.42,.06,.02).translate(0,2.95,1.04),_e.coral,{outline:.8})}function s0(i,e,t,n,s,r={}){let o=ln(i,e,t,n,s),a=r.len??3.2;o(di((l,c)=>c.set(0,.42*Math.sin(l*Math.PI)*.25,-a/2+a*l),l=>({a:.62*Math.pow(Math.sin(l*Math.PI),.55)+.01,bt:.02,bb:.5*Math.pow(Math.sin(l*Math.PI),.5)+.01}),{rings:18,radial:16}),r.color??_e.white,{spec:.35,outline:1}),o(rt(.92,.03,a*.62,.012).translate(0,.03,0),_e.navy,{outline:.7});for(let l of[-.55,.5])o(rt(1,.05,.24,.012).translate(0,.09,l),_e.woodLight,{outline:.8});o(gn([[.55,0,-.3],[.75,.06,.2],[.6,.02,.8]],.028,{tubular:6,radial:6}),_e.wood,{outline:.7})}function r0(i,e,t,n,s,r={}){let o=ln(i,e,t,n,s);o(rt(.11,2.7,.11,.02).translate(0,1.35,0),_e.woodDark,{outline:.9}),o(Mt(.09,8,6),_e.coral,{outline:.7},[0,2.74,0]);let a=(l,c)=>l>0?[[0,-.13],[c-.16,-.13],[c,0],[c-.16,.13],[0,.13]]:[[0,-.13],[.16-c,-.13],[-c,0],[.16-c,.13],[0,.13]];o(nn(a(1,.95),.035,{bevel:.006}),_e.teal,{outline:.9},[.05,2.25,0],[0,0,0]),o(nn(a(-1,.85),.035,{bevel:.006}),_e.coral,{outline:.9},[-.05,1.95,0],[0,r.back?Math.PI:0,0])}function o0(i,e,t,n,s){let r=ln(i,e,t,n,s);for(let o=-1;o<=1;o++)r(rt(1.8,.045,.3,.012),_e.woodLight,{outline:.9},[0,.76,o*.31]);for(let o of[-.66,.66])r(rt(1.8,.045,.28,.012),_e.wood,{outline:.9},[0,.45,o]);for(let o of[-.7,.7]){for(let a of[-1,1])r(rt(.09,.98,.09,.012),_e.woodDark,{outline:.8},[o,.44,a*.46],[a*.5,0,0]);r(rt(.07,.06,1.5,.01),_e.woodDark,{outline:.7},[o,.38,0])}}function a0(i,e,t,n,s,r={}){let o=ln(i,e,t-.04,n,s),a=6,l=2.6,c=1.6,u=2.4;for(let h=0;h<a;h++){let f=[[-l/2,0],[l/2,0],[0,c]],d=nn(f,u/a-.004,{bevel:0});d.translate(0,0,-u/2+h*u/a),o(d,h%2?r.color??_e.coral:_e.cream,{outline:1})}o(nn([[-.55,0],[.55,0],[0,1]],.02,{bevel:0}),_e.navy,{outline:.8},[0,.01,u/2+.005]),o(it(.02,.02,.9,6),_e.woodDark,{outline:.5},[0,.45,u/2+.5]),o(nn([[0,0],[.34,-.07],[0,-.16]],.006,{bevel:0}),_e.sun,{outline:.6},[0,.9,u/2+.5]),o(rt(.9,.22,.55,.06),_e.sky,{outline:.8},[1.9,.11,.5],[0,.4,0])}function c0(i,e,t,n,s={}){let r=new at;r.name="lighthouse",r.position.set(e,t,n),r.rotation.y=s.rotY??0;let o=new Et("lighthouse"),a=ln(o,0,0,0,0);a(it(3.9,4.3,.6,28).translate(0,.3,0),_e.stone,{outline:1}),a(it(3.3,3.7,.6,28).translate(0,.9,0),_e.stone,{outline:1});let l=1.2,c=19.5,u=E=>st(2.95,2.05,(E-l)/(c-l));for(let E=0;E<6;E++){let A=st(l,c,E/6),b=st(l,c,(E+1)/6);a(it(u(b),u(A),b-A,28).translate(0,(A+b)/2,0),E%2?_e.coral:_e.white,{outline:1})}a(it(3.05,2.95,.32,28).translate(0,c+.16,0),_e.iron,{outline:1});for(let E=0;E<20;E++){let A=E/20*He;a(it(.03,.03,.95,5).translate(Math.cos(A)*2.88,c+.8,Math.sin(A)*2.88),_e.iron,{outline:.6})}a(fi(2.88,.035,6,40).rotateX(Math.PI/2).translate(0,c+1.28,0),_e.iron,{outline:.7});for(let E=0;E<10;E++){let A=E/10*He;a(rt(.08,2.2,.08,.01).rotateY(-A).translate(Math.cos(A)*1.56,c+1.45,Math.sin(A)*1.56),_e.iron,{outline:.7})}a(it(1.7,1.7,.16,20).translate(0,c+.4,0),_e.iron,{outline:.8}),a(it(.08,1.95,1.3,12).translate(0,c+3.7,0),_e.coral,{outline:1}),a(Mt(.17,10,8).translate(0,c+4.42,0),_e.iron,{outline:.8}),a(rt(1.05,2,.3,.06).translate(0,l+1,2.82),_e.navy,{outline:.9});for(let E=0;E<4;E++){let A=.9+E*1.9,b=5+E*3.4,M=u(b);a(rt(.42,.66,.3,.05).rotateY(-A).translate(Math.cos(A)*M,b,Math.sin(A)*M),_e.navy,{outline:.8})}a(rt(5,2.8,3.8,.08).translate(7.2,1.4,.6),_e.cream,{outline:1}),a(nn([[-2.9,0],[2.9,0],[0,1.5]],4.4,{bevel:.03}).translate(7.2,2.8,.6),_e.sky,{outline:1}),a(rt(.9,1.9,.2,.05).translate(6,.95,2.55),_e.woodDark,{outline:.8});for(let E of[7.6,8.7])a(rt(.9,.9,.2,.05).translate(E,1.6,2.55),16773572,{lamp:1,outline:.8});a(rt(.6,1.2,.6,.04).translate(8.6,4.3,.2),_e.stone,{outline:.8});let h=o.build(i);r.add(h);let f=_t(i,16774872,{spec:.9,specSize:.3,emissive:16767351,emissiveLevel:0,opacity:1}),d=new $e(new Bn(1.5,1.5,2.2,20,1,!0),f);d.position.y=c+1.45,d.castShadow=!1,r.add(d);let g=_t(i,16776168,{emissive:16773296,emissiveLevel:.1}),x=new $e(Mt(.72,16,12),g);x.position.y=c+1.45,r.add(x);let p=new at;p.position.y=c+1.45,r.add(p);let m=cc(i,16773560,{opacity:0,power:.55});for(let E of[0,Math.PI]){let A=new Bn(.6,19,190,20,1,!0).rotateX(-Math.PI/2).translate(0,0,95),b=A.attributes.uv;for(let R=0;R<b.count;R++)b.setY(R,1-b.getY(R));let M=new $e(A,m);M.rotation.y=E,M.frustumCulled=!1,p.add(M)}let y=new D,_=new D(0,0,1),v=0,w=0;return{group:r,lampPos:y,lightDir:_,beam:p,get top(){return new D(e,t+c+4.5,n)},update(E,A){let b=A.lampLevel??0;v+=(b-v)*Math.min(1,E*2),w+=E*.42,p.rotation.y=w,m.uniforms.uOpacity.value=.42*v,p.visible=v>.02,f.uniforms.uEmissiveLevel.value=v*.85,g.uniforms.uEmissiveLevel.value=.1+v*.9,r.updateMatrixWorld(),y.set(0,c+1.45,0).applyMatrix4(r.matrixWorld),_.set(Math.sin(w),-.03,Math.cos(w)).normalize()},light(){return{pos:y,dir:_,color:new we(1,.93,.72),cosInner:.985,cosOuter:.95,range:260,intensity:.55*v}}}}function l0(i,e,t={}){let n=t.w??1.6,s=t.h??.5,r=t.bg??"#2f7f86",o=t.fg??"#fff8e6",a=Ki(512,512*s/n,(c,u,h)=>{c.fillStyle=r,c.fillRect(0,0,u,h),c.strokeStyle=o,c.lineWidth=10,c.strokeRect(14,14,u-28,h-28),c.fillStyle=o,c.font=`700 ${Math.round(h*.52)}px "Microsoft YaHei UI","Microsoft YaHei","PingFang SC","Noto Sans SC",sans-serif`,c.textAlign="center",c.textBaseline="middle",c.fillText(e,u/2,h/2+h*.03)},{wrap:!1,aniso:8}),l=new $e(new Bs(n,s),_t(i,16777215,{map:a,rim:.2}));return l.castShadow=!1,l.receiveShadow=!1,l}function u0(i,e,t,n={}){let s=new at;s.name="pier";let r=Math.atan2(t.x,t.z),o=n.len??32,a=4.4,l=e.y,c=new Et("pier"),u=ln(c,e.x,0,e.z,r),h=-3.2;for(let y=1.5;y<=o;y+=4)for(let _ of[-a/2+.25,a/2-.25])u(it(.15,.18,l-h,10).translate(_,(l+h)/2-.1,y),_e.woodDark,{outline:.9}),u(it(.17,.17,.1,10).translate(_,l+.62,y),_e.woodDark,{outline:.7});for(let y=0;y<5;y++)u(rt(a/5-.04,.14,o,.02).translate(-a/2+a/10*(y*2+1),l-.07,o/2),y%2?_e.wood:_e.woodLight,{outline:.9});for(let y of[-a/2,a/2])u(rt(.14,.22,o,.02).translate(y,l-.2,o/2),_e.woodDark,{outline:.8});for(let y of[-a/2+.1,a/2-.1]){for(let _=1;_<=o-1;_+=2.5)_<o-5&&u(it(.04,.045,1,6).translate(y,l+.5,_),_e.white,{spec:.3});u(gn([[y,l+.98,1],[y,l+.98,o-5]],.03,{tubular:1,radial:6}),_e.white,{spec:.3,outline:.7})}let f=[];for(let[y,_]of[[-a/2+.2,9],[a/2-.2,20]])u(it(.045,.055,2.6,8).translate(y,l+1.3,_),_e.teal,{}),u(Mt(.14,10,8).translate(y,l+2.7,_),_e.lampGlass,{lamp:1,spec:.5}),f.push(new D(y,l+2.7,_).applyMatrix4(new qe().makeRotationY(r)).add(new D(e.x,0,e.z)));let d=o-3.4;u(rt(3.8,.3,3.4,.03).translate(0,l+.15,d),_e.woodDark,{outline:.9}),u(rt(3.6,2.4,3,.06).translate(0,l+1.5,d+.2),_e.cream,{outline:1}),u(rt(4.2,.14,3.8,.03).rotateX(-.12).translate(0,l+2.85,d+.2),_e.sky,{outline:1}),u(rt(3.2,.9,.2,.03).translate(0,l+1.75,d-1.32),_e.navy,{outline:.8}),u(rt(3.4,.1,.9,.02).translate(0,l+1.2,d-1.75),_e.woodLight,{outline:.8});for(let y=0;y<8;y++)u(rt(.42,.05,1.1,.01).rotateX(.35).translate(-1.68+y*.48,l+2.5,d-1.75),y%2?_e.coral:_e.cream,{outline:.8});for(let[y,_,v]of[[-2.3,d-1.6,.5],[-2.5,d-.7,.4],[2.4,d-1.4,.48],[.9,d-2.2,.36]])u(rt(v,v*.8,v,.03).translate(y,l+v*.4,_),_e.wood,{outline:.9});for(let y of[1.9,2.5])u(it(.24,.2,.6,12).translate(y,l+.3,d-2.5),_e.teal,{outline:.9});u(fi(.3,.05,6,18).rotateX(Math.PI/2).translate(-1.4,l+.05,6),_e.cream,{outline:.7});let g=c.build(i);s.add(g);let x=l0(i,n.sign??"\u9C9C\u9C7C \xB7 \u6BCF\u65E5\u73B0\u6355",{w:2.6,h:.62,bg:"#c9503f",fg:"#fff8e6"});x.position.set(0,l+3.18,d-.6).applyMatrix4(new qe().makeRotationY(r)).add(new D(e.x,0,e.z)),x.rotation.y=r+Math.PI,s.add(x);let p=l0(i,"\u6808\u6865",{w:1.1,h:.4,bg:"#2f7f86",fg:"#fff8e6"});p.position.set(-a/2+.1,l+1.25,1.2).applyMatrix4(new qe().makeRotationY(r)).add(new D(e.x,0,e.z)),p.rotation.y=r+Math.PI/2,s.add(p);let m=new D(0,l,o).applyMatrix4(new qe().makeRotationY(r)).add(new D(e.x,0,e.z));return{group:s,lamps:f,end:m}}function h0(i,e={}){let t=new at;t.name="gull";let n=new Et("gullBody");n.add(ea(.11,.095,.32,12,9),null,_e.white,{outline:1}),n.add(Mt(.085,10,8).translate(0,.06,.24),null,_e.white,{outline:1}),n.add(it(.004,.02,.12,6).rotateX(Math.PI/2).translate(0,.05,.37),null,_e.orange,{outline:.6}),n.add(nn([[-.05,0],[.05,0],[.11,-.2],[-.11,-.2]],.016,{bevel:.003}).rotateX(-Math.PI/2).translate(0,.01,-.2),null,_e.gullGray,{outline:.8}),t.add(n.build(i));let s=[[0,-.12],[.44,-.07],[.44,.1],[0,.13]],r=[[.44,-.07],[.74,-.015],[.76,.035],[.44,.1]],o=[];for(let l of[1,-1]){let c=new Et("gullWing");c.add(nn(s,.02,{bevel:.004}),null,_e.white,{outline:1}),c.add(nn(r,.02,{bevel:.004}),null,_e.gullGray,{outline:1});let u=new at;u.position.set(l*.07,.03,.02);let h=c.build(i);l<0&&(h.scale.x=-1),u.add(h),t.add(u),o.push({pivot:u,side:l})}let a={phase:Math.random()*10,flap:7+Math.random()*3,glide:0};return{group:t,update(l,c={}){let u=c.flapping??!0;a.glide+=(u?-1:1)*.08,a.glide=ct(a.glide,0,1);let h=Math.sin(l*a.flap+a.phase)*.62-.08,f=st(h,.12,a.glide);for(let d of o)d.pivot.rotation.z=-d.side*f}}}function f0(i,e=_e.coral){let t=new Et("buoy"),n=ln(t,0,0,0,0);return n(Mt(.36,16,12),e,{spec:.4}),n(it(.365,.365,.1,16).translate(0,.06,0),_e.cream,{outline:.7}),n(it(.028,.03,.8,6).translate(0,.62,0),_e.iron,{outline:.6}),n(fi(.11,.014,5,14).rotateX(Math.PI/2).translate(0,.86,0),_e.iron,{outline:.5}),n(Mt(.075,10,8).translate(0,1.05,0),16773572,{lamp:1,spec:.6}),t.build(i)}var HT=Object.freeze({L:1,R:-1}),ze=Object.freeze({wheelR:.345,tireR:.052,rimR:.252,hubR:.034,spokes:32,rearZ:-.56,frontZ:.56,bb:[0,.29,-.09],crank:.17,pedalX:.165,pedalTop:.035,ringTeeth:44,cogTeeth:18,chainPitch:.0127,ringX:-.054,cogX:-.05,saddle:[0,.868,-.265],hip:[.165,.925,-.235],thigh:.39,shin:.39,ankleUp:.072,ankleBack:.012,shoulder:[.17,1.37,.02],upperArm:.31,foreArm:.29,grip:[.3,1.05,.265],headTubeTop:[0,1,.4],headTubeBot:[0,.78,.47],forkCrown:[0,.775,.475],stemTop:[0,1.065,.385]}),d0=(i,e=ze.chainPitch)=>e/(2*Math.sin(Math.PI/i)),Rc=d0(ze.ringTeeth),Gh=d0(ze.cogTeeth),Q_=Object.freeze([.75,1,1.33]),p0=(i=1)=>ze.ringTeeth/ze.cogTeeth*Q_[ct(i|0,0,2)];function Wh(i,e,t=[0,0,0]){return t[0]=i*ze.pedalX,t[1]=ze.bb[1]+ze.crank*Math.cos(e),t[2]=ze.bb[2]+ze.crank*Math.sin(e),t}function m0(){let[i,e]=[ze.bb[2],ze.bb[1]],[t,n]=[ze.rearZ,ze.wheelR],s=Rc,r=Gh,o=t-i,a=n-e,l=Math.hypot(o,a),c=Math.atan2(a,o),u=Math.acos(ct((s-r)/l,-1,1)),h=c-u,f=c+u,d=(m,y,_,v)=>[m+_*Math.cos(v),y+_*Math.sin(v)],g=h-f;g<=0&&(g+=He);let x=f-h;x<=0&&(x+=He);let p=[{type:"line",a:d(t,n,r,h),b:d(i,e,s,h)},{type:"arc",c:[i,e],r:s,a0:h,sweep:-g},{type:"line",a:d(i,e,s,f),b:d(t,n,r,f)},{type:"arc",c:[t,n],r,a0:f,sweep:-x}];for(let m of p)m.len=m.type==="line"?Math.hypot(m.b[0]-m.a[0],m.b[1]-m.a[1]):Math.abs(m.sweep)*m.r;return{segs:p,length:p.reduce((m,y)=>m+y.len,0),wrap1:g,wrap2:x,aTop:h,aBot:f,r1:s,r2:r}}function Xh(i,e,t=[0,0]){e=(e%i.length+i.length)%i.length;for(let s of i.segs){if(e<=s.len+1e-9){let r=s.len>0?e/s.len:0;if(s.type==="line")t[0]=s.a[0]+(s.b[0]-s.a[0])*r,t[1]=s.a[1]+(s.b[1]-s.a[1])*r;else{let o=s.a0+s.sweep*r;t[0]=s.c[0]+s.r*Math.cos(o),t[1]=s.c[1]+s.r*Math.sin(o)}return t}e-=s.len}let n=i.segs[i.segs.length-1];return t[0]=n.b?n.b[0]:n.c[0],t[1]=n.b?n.b[1]:n.c[1],t}var gt=Object.freeze({frame:7655352,cream:16050898,chrome:14870250,spoke:13225686,dark:3882314,tire:15721414,tread:5065046,leather:12152892,brass:15317322,wood:12618325,fish:10471914,fishBack:5605824,skin:15764028}),zn=ze.wheelR,Cc=i=>new D(i[0],i[1],i[2]),qh={spec:.55,specSize:.5},In={spec:.85,specSize:.42};function g0(i,e,t,n=[]){let s=[],r=e-.0065,o=e+.0062,a=He/i;for(let u=0;u<i;u++){let h=u*a;s.push([r*Math.cos(h),r*Math.sin(h)]),s.push([r*Math.cos(h+a*.3),r*Math.sin(h+a*.3)]),s.push([o*Math.cos(h+a*.45),o*Math.sin(h+a*.45)]),s.push([o*Math.cos(h+a*.62),o*Math.sin(h+a*.62)]),s.push([r*Math.cos(h+a*.78),r*Math.sin(h+a*.78)])}let l=new ls(s.map(u=>new be(u[0],u[1])));for(let[u,h,f]of n){let d=new Ns;d.absarc(u,h,f,0,He,!0),l.holes.push(d)}let c=new Os(l,{depth:t,bevelEnabled:!1,curveSegments:12});return c.translate(0,0,-t/2),c.rotateY(Math.PI/2),c}function eM(i,e,t,n,s,r,o){let a=[],l=Math.round(r*14);for(let c=0;c<=l;c++){let u=c/l,h=u*r*He;a.push([i+s*Math.cos(h),e+(t-e)*u,n+s*Math.sin(h)])}return gn(a,o,{tubular:l*2,radial:6})}function x0(i,e,t,n,s=.062,r=.011){return di((o,a)=>{let l=(e+(t-e)*o)*Math.PI/180;a.set(0,zn+n*Math.sin(l),i+n*Math.cos(l))},{a:s,bt:r,bb:r*1.25},{rings:30,radial:16,caps:[!1,!1],ref:new D(1,0,0)})}function Yh(i=.24){let e=new Et("fish"),t=i/.24;e.add(di((s,r)=>r.set(0,0,-i*.5+i*s),s=>{let r=Math.sin(Math.PI*Math.pow(s,.72))*(1-.25*s);return{a:.078*t*r+.002,bt:.17*t*r+.002,bb:.15*t*r+.002}},{rings:18,radial:16}),null,gt.fish,{spec:.7,specSize:.5}),e.add(di((s,r)=>r.set(0,.012*t,-i*.42+i*.72*s),s=>{let r=Math.sin(Math.PI*Math.pow(s,.8))*.5+.01;return{a:.06*t*r,bt:.06*t*r,bb:.012}},{rings:12,radial:12}),null,gt.fishBack,{outline:0});let n=nn([[-.05*t,0],[-.12*t,.1*t],[-.085*t,0],[-.12*t,-.1*t]],.012*t,{bevel:.003});e.add(n.rotateY(-Math.PI/2).translate(0,0,-i*.52),null,gt.fishBack,{outline:.8});for(let s of[1,-1])e.addAt(Mt(.014*t,10,8),[s*.026*t,.02*t,i*.36],[0,0,0],[1,1,1],1907236,{outline:0});return e}function Pc(i,e,t,n={},s=1){let r=new $e(e,_t(i,t,n));return r.castShadow=n.castShadow??!0,r.receiveShadow=!0,s>0&&Or(r,i,{px:s}),r}function v0(i,e={}){let t=new at;t.name="bicycle";let n=ze,s=e.detail??1,r=new Et("wheel"),o=zn-ze.tireR;r.add(fi(o,ze.tireR,16,72).rotateY(Math.PI/2),null,gt.tire,{outline:1}),r.add(fi(zn-.004,.012,8,80).rotateY(Math.PI/2),null,gt.tread,{outline:.35}),r.add(it(.256,.256,.03,64,!0).rotateZ(Math.PI/2),null,gt.cream,{spec:.35,outline:.7});for(let Y of[1,-1])r.add(fi(.256,.0065,6,64).rotateY(Math.PI/2).translate(Y*.015,0,0),null,gt.chrome,{...In,outline:.5});r.add(it(.034,.034,.09,16).rotateZ(Math.PI/2),null,gt.chrome,In);for(let Y of[1,-1])r.add(it(.048,.044,.01,16).rotateZ(Math.PI/2).translate(Y*.034,0,0),null,gt.chrome,{...In,outline:.6});let a=s>=1?ze.spokes:16;for(let Y=0;Y<a;Y++){let G=Y/a*He,H=Y%2?1:-1,se=G+(Y%4<2?1:-1);r.add(Ac([H*.034,.044*Math.cos(se),.044*Math.sin(se)],[0,.252*Math.cos(G),.252*Math.sin(G)],.0034,5),null,gt.spoke,{outline:0})}r.add(it(.0065,.0065,.045,8).translate(0,-.225,0),null,gt.chrome,{outline:0});let l=r.build(i),c=new at;c.name="rearWheel",c.position.set(0,zn,ze.rearZ),c.add(l);let u=new Et("cog");u.add(g0(ze.cogTeeth,Gh,.036,[[0,0,.012]]),null,gt.dark,{...In,outline:.8});let h=u.build(i);h.position.x=ze.cogX,c.add(h),t.add(c);let f=new at;f.name="frontWheel",f.add(l.clone());let d=new Et("frame"),g=(Y,G)=>d.add(gn(Y,G,{tubular:22,radial:12}),null,gt.frame,qh),x=(Y,G)=>d.add(gn(Y,G,{tubular:18,radial:10}),null,gt.chrome,In);g([n.headTubeBot,[0,.89,.435],n.headTubeTop],.028),g([n.headTubeBot,[0,.56,.24],[0,.36,.02],n.bb],.029),g([n.bb,[0,.55,-.17],[0,.8,-.252]],.026),g([[0,.985,.405],[0,1,.1],[0,.86,-.22],[0,.8,-.252]],.024);for(let Y of[1,-1])g([[Y*.03,.29,-.09],[Y*.05,.31,-.32],[Y*.065,zn,ze.rearZ]],.015),g([[Y*.022,.79,-.255],[Y*.05,.58,-.42],[Y*.065,zn+.012,ze.rearZ]],.013);x([[0,.8,-.252],[0,.845,-.266]],.017),d.add(di((Y,G)=>G.set(0,.85,-.39+.26*Y),Y=>({a:.004+.098*Math.pow(Math.sin(Math.PI*Math.pow(Y,.62)),.7)*(1-.62*Y),bt:.006+.013*Math.sin(Math.PI*Y),bb:.01+.026*Math.sin(Math.PI*Math.pow(Y,.8))}),{rings:20,radial:18}),null,gt.leather,{spec:.35,specSize:.6});for(let Y of[1,-1])d.add(eM(Y*.058,.79,.838,-.352,.021,4.5,.0055),null,gt.chrome,{...In,outline:.7});d.add(rt(.16,.012,.03,.005).translate(0,.836,-.352),null,gt.chrome,{...In,outline:.7}),d.add(x0(ze.rearZ,52,198,.378),null,gt.frame,qh);for(let Y of[1,-1])for(let G of[1.05,2.75])x([[Y*.068,zn+.004,ze.rearZ],[Y*.064,zn+.37*Math.sin(G),ze.rearZ+.37*Math.cos(G)]],.006);for(let Y of[1,-1])x([[Y*.065,zn+.02,ze.rearZ],[Y*.125,.73,-.46],[Y*.125,.73,-.745]],.007),x([[Y*.125,.73,-.47],[Y*.07,.8,-.3]],.006);x([[-.125,.73,-.745],[.125,.73,-.745]],.007),x([[-.125,.73,-.46],[.125,.73,-.46]],.007);{let Y=new Et("crate");Y.add(rt(.3,.15,.25,.012),null,16777215,{outline:1});let G=Y.build(i,{map:Gp()});G.position.set(0,.81,-.605),t.add(G)}x([[.135,.84,-.7],[.135,1.3,-.72],[.135,1.8,-.755]],.0065),d.add(Mt(.016,10,8).translate(.135,1.805,-.755),null,gt.brass,{...In,outline:.8}),t.add(d.build(i));let p=Cc(n.headTubeTop),m=Cc(n.headTubeTop).sub(Cc(n.headTubeBot)).normalize(),y=new Ut().setFromUnitVectors(new D(0,1,0),m),_=Y=>Cc(Y).sub(p).applyQuaternion(y.clone().invert()),v=new at;v.name="steerPivot",v.position.copy(p),v.quaternion.copy(y);let w=new at;w.name="steer",v.add(w),t.add(v);let S=new Et("steer"),E=(Y,G,H=gt.chrome,se=In)=>S.add(gn(Y,G,{tubular:18,radial:10}),null,H,se);E([n.headTubeTop,n.stemTop],.018),E([[0,1.062,.39],[0,1.075,.415]],.016);let A=[[0,1.075,.415],[.1,1.078,.405],[.2,1.072,.35],[.275,1.057,.283],[.302,1.05,.262]];E(A,.0145),E(A.map(Y=>[-Y[0],Y[1],Y[2]]),.0145);for(let Y of[1,-1])S.add(gn([[Y*.243,1.059,.295],[Y*.305,1.0495,.26],[Y*.33,1.046,.25]],.0225,{tubular:8,radial:14}),null,gt.leather,{spec:.3,specSize:.6}),S.add(Mt(.0225,12,10).translate(Y*.33,1.046,.25),null,gt.leather,{outline:.8});S.add(rt(.125,.03,.055,.01).translate(0,.772,.482),null,gt.chrome,{...In,outline:.8});for(let Y of[1,-1])E([[Y*.052,.768,.487],[Y*.059,.6,.507],[Y*.059,.44,.548],[Y*.053,zn+.004,ze.frontZ]],.0155);S.add(x0(ze.frontZ,-22,112,.378),null,gt.frame,qh);for(let Y of[1,-1])for(let G of[.55,1.75])E([[Y*.068,zn+.004,ze.frontZ],[Y*.064,zn+.37*Math.sin(G),ze.frontZ+.37*Math.cos(G)]],.006);S.add(it(.043,.047,.09,20).rotateX(Math.PI/2).translate(0,.842,.575),null,gt.chrome,In),S.add(Mt(.043,20,10,0,He,Math.PI/2,Math.PI/2).rotateX(-Math.PI/2).translate(0,.842,.53),null,gt.chrome,{...In,outline:.6});let b;{let Y=new Et("basket"),G=.21,H=.895,se=.505,me=.165,I=.118,T=.215,W=.152,te=[[-1,-1],[1,-1],[1,1],[-1,1]],ve=(z,ne)=>{let[k,ue]=te[z],[xe,Ie]=te[(z+1)%4],Ge=new ft;return Ge.setAttribute("position",new ut([k*me,H,se+ue*I,xe*me,H,se+Ie*I,xe*T,H+G,se+Ie*W,k*T,H+G,se+ue*W],3)),Ge.setAttribute("uv",new ut([0,0,1,0,1,1,0,1],2)),Ge.setIndex(ne?[0,1,2,0,2,3]:[0,2,1,0,3,2]),Ge.computeVertexNormals(),Ge};for(let z=0;z<4;z++)Y.add(ve(z,!1),null,16777215,{outline:1.1}),Y.add(ve(z,!0),null,15126430,{outline:0});Y.add(rt(me*2,.014,I*2,.004).translate(0,H+.007,se),null,13212254,{outline:.7});for(let[z,ne]of te)Y.add(Ac([z*me,H,se+ne*I],[z*T,H+G,se+ne*W],.012,6),null,11106111,{outline:.8});let P=Hp();P.repeat.set(2,1),b=Y.build(i,{map:P})}E(Cp(.44,.314,.05,5).map(Y=>[Y[0],1.105,.505+Y[1]]).concat([[.22,1.105,.505]]),.016,13212254,{spec:.1});for(let Y of[1,-1])E([[Y*.068,zn+.004,ze.frontZ],[Y*.15,.895,.57]],.0065);let M=S.build(i);M.position.copy(_([0,0,0])),b.position.copy(_([0,0,0])),w.add(M,b),f.position.copy(_([0,zn,ze.frontZ])),w.add(f);let R=Pc(i,it(.038,.038,.006,20).rotateX(Math.PI/2).translate(0,.842,.621),16774340,{emissive:16769162,emissiveLevel:0,spec:.9,specSize:.4},.6),L=R.material;R.position.copy(_([0,0,0])),R.castShadow=!1,w.add(R);let U=new Gt;U.name="lampAnchor",U.position.copy(_([0,.842,.63])),w.add(U);let V=Pc(i,it(.016,.02,.024,12),3882314,{spec:.5},.8);V.position.copy(_([.15,1.098,.383])),w.add(V);let X=new at;X.name="bell",X.position.copy(_([.15,1.122,.383])),X.add(Pc(i,Mt(.034,20,10,0,He,0,Math.PI/2),gt.brass,{spec:.95,specSize:.38},.9)),X.add(Pc(i,it(.012,.012,.02,10),gt.dark,{spec:.4},.5).translateY(-.008)),w.add(X);{let Y=Yh(.23).build(i);Y.name="basketFish";let G=new Ut().setFromEuler(new en(Math.PI/2,0,0));for(let[H,se]of[[[.075,1.035,.5],[.16,.25,.3]],[[-.07,1.045,.535],[.12,-.7,-.36]]]){let me=Y.clone();me.position.copy(_(H)),me.quaternion.setFromEuler(new en(se[0],se[1],se[2])).multiply(G),w.add(me)}}let $=new Gt;$.position.copy(_([ze.grip[0]-.02,ze.grip[1],ze.grip[2]+.02])),w.add($);let K=new Gt;K.position.copy(_([-ze.grip[0]+.02,ze.grip[1],ze.grip[2]+.02])),w.add(K);let O=new at;O.name="crank",O.position.set(0,n.bb[1],n.bb[2]),t.add(O);{let Y=new Et("ring"),G=[[0,0,.013]];for(let se=0;se<5;se++){let me=se/5*He+.3;G.push([.048*Math.cos(me),.048*Math.sin(me),.019])}Y.add(g0(ze.ringTeeth,Rc,.005,G),null,gt.chrome,{...In,outline:.8}),Y.add(it(.024,.024,.03,14).rotateZ(Math.PI/2),null,gt.dark,{outline:.8});let H=Y.build(i);H.position.x=ze.ringX,O.add(H)}let j=[];for(let Y of[1,-1]){let G=new at;G.position.x=Y*.105,Y<0&&(G.rotation.x=Math.PI),O.add(G);let H=new Et("arm");H.add(rt(.02,n.crank+.045,.034,.008).translate(0,n.crank/2,0),null,gt.chrome,{...In,outline:.9}),H.add(it(.03,.03,.022,16).rotateZ(Math.PI/2),null,gt.chrome,{...In,outline:.8}),G.add(H.build(i));let se=new at;se.name=Y>0?"pedalL":"pedalR",se.position.set(0,n.crank,0),G.add(se);let me=new Et("pedal");me.add(it(.009,.009,.085,10).rotateZ(Math.PI/2).translate(Y*.045,0,0),null,gt.chrome,{outline:.5}),me.add(rt(.105,.02,.082,.006).translate(Y*.105,.002,0),null,gt.dark,{outline:1});for(let I of[1,-1])me.add(rt(.085,.012,.006,.002).translate(Y*.105,.002,I*.042),null,15901244,{outline:.6});se.add(me.build(i)),j.push({side:Y,arm:G,pedal:se})}let J={};{let Y=new Et("foot"),G=[[-.03,-.035],[.03,-.035]];for(let se of[.42,0,-.42])G.push([.05*Math.sin(se)+.012,.085*Math.cos(se)+.03]);Y.add(nn(G,.014,{bevel:.004}),null,gt.skin,{spec:.25});for(let se of[-.42,0,.42])Y.add(Ac([.012,0,0],[.05*Math.sin(se)+.012,0,.1*Math.cos(se)+.035],.0125,7),null,gt.skin,{outline:.9});let H=Y.build(i);for(let{side:se,pedal:me}of j){let I=H.clone();I.name=se>0?"footL":"footR",I.position.set(se*.105,.016,-.012),I.rotation.y=-se*.14,me.add(I),J[se]=I}}let F=m0(),ie=ze.chainPitch,pe=Math.round(F.length/ie),ge=new Ls(rt(.0115,.0085,ie*.98,.003,1),_t(i,gt.dark,{spec:.6}),pe);ge.instanceMatrix.setUsage(Yi),ge.castShadow=!1,ge.frustumCulled=!1,ge.name="chain",t.add(ge);let oe={cols:9,rows:3,len:.34,h:.17,x:.135,y:1.795,z:-.758},Z=new Float32Array(oe.cols*oe.rows*3),ee=new ft;{let Y=[];for(let H=0;H<oe.rows-1;H++)for(let se=0;se<oe.cols-1;se++){let me=H*oe.cols+se,I=me+1,T=me+oe.cols,W=T+1;Y.push(me,I,T,I,W,T)}let G=new Float32Array(oe.cols*oe.rows*2);for(let H=0;H<oe.rows;H++)for(let se=0;se<oe.cols;se++)G[(H*oe.cols+se)*2]=se/(oe.cols-1),G[(H*oe.cols+se)*2+1]=H/(oe.rows-1);ee.setAttribute("position",new Ze(Z,3).setUsage(Yi)),ee.setAttribute("uv",new Ze(G,2)),ee.setIndex(Y)}let ye=new $e(ee,_t(i,16777215,{map:Wp("#ee5f4d","#fff3dc",6),side:Wt,spec:.1,pbr:"fabric"}));ye.name="flag",ye.castShadow=!0,ye.frustumCulled=!1,t.add(ye);let Ee=new qe,Te=new Ut,Ae=new D,Re=new D,N=new en,fe=[0,0],le=[0,0],ce={chainS:0,bellT:-1,lamp:0,steerAngle:0},de={root:t,flag:ye,lampAnchor:U,rearWheel:c,frontWheel:f,crankGroup:O,chain:ge,steer:w,pedals:j,feet:J,bell:X,gripL:$,gripR:K,lens:R,get steerAngle(){return ce.steerAngle},get lamp(){return ce.lamp},update(Y,G,H={}){let se=ce;c.rotation.x=f.rotation.x=-Y.wheel,O.rotation.x=-Y.crank;for(let{side:W,pedal:te}of j)te.rotation.x=Y.crank+(W<0?-Math.PI:0);se.chainS=(se.chainS+Y.crankVel*G*Rc+F.length)%F.length;for(let W=0;W<pe;W++){let te=W*ie+se.chainS;Xh(F,te,fe),Xh(F,te+.004,le),N.set(-Math.atan2(le[1]-fe[1],le[0]-fe[0]),0,0),Te.setFromEuler(N),Ae.set(ze.ringX+(W%2?.0035:-.0035),fe[1],fe[0]),Re.set(W%2?1.25:.8,1,1),ge.setMatrixAt(W,Ee.compose(Ae,Te,Re))}ge.instanceMatrix.needsUpdate=!0;let me=Y.v<2.2&&Y.v>.05?Math.sin(Y.time*5.2)*.035*(1-Y.v/2.2):0;if(se.steerAngle=ct(Math.atan(H.curvature??0)*1.12,-.5,.5)+me,w.rotation.y=Y.air?se.steerAngle*.5:se.steerAngle,H.ringBell&&(se.bellT=0),se.bellT>=0){se.bellT+=G;let W=Math.exp(-se.bellT*5.5);X.rotation.z=Math.sin(se.bellT*85)*.16*W,X.rotation.x=Math.cos(se.bellT*63)*.07*W,se.bellT>1.6&&(se.bellT=-1,X.rotation.set(0,0,0))}let I=H.lampLevel??0;se.lamp+=(I-se.lamp)*Math.min(1,G*3),L.uniforms.uEmissiveLevel.value=se.lamp;let T=Math.min(Y.v,13);for(let W=0;W<oe.rows;W++)for(let te=0;te<oe.cols;te++){let ve=te/(oe.cols-1),P=W/(oe.rows-1),z=ve*7.5-Y.time*(3+T*1.1)+P*.9,ne=(.006+.028*Math.min(1,T/6))*ve,k=(1-Math.min(1,T/2.2))*ve*ve*.16,ue=(W*oe.cols+te)*3;Z[ue]=oe.x+Math.sin(z*.7+1)*ne*.8,Z[ue+1]=oe.y-ve*.012-oe.h*(1-ve*.92)*P-k+Math.cos(z)*ne,Z[ue+2]=oe.z-oe.len*ve}ee.attributes.position.needsUpdate=!0,ee.computeVertexNormals()}};return de.update({wheel:0,crank:Math.PI/2,crankVel:0,v:0,time:0,air:!1},.016,{}),de}var pi=()=>new D,Qs=pi(),y0=pi();function _0(i,e={}){let t=e.track??Tc(),n=t.length,s=Pn(e.seed??20241124),r=e.quality??2,o=new at;o.name="world";let a={},l=(P,z,ne={})=>(t.frameAt((P%n+n)%n,a),ne.x=a.pos[0]+a.right[0]*z,ne.z=a.pos[2]+a.right[2]*z,ne.y=ii(t,ne.x,ne.z),ne.roadY=a.pos[1],ne.yawSea=Math.atan2(a.right[0],a.right[2]),ne.yawFwd=Math.atan2(a.fwd[0],a.fwd[2]),ne),c=Pp(i);o.add(c.dome);let u=Lp(i,r===0?6:10);o.add(u.group);let h=Fp(i);o.add(h.mesh);let f=Bp(i,t,{step:r===0?3.6:2.6});o.add(f.mesh);let d=qp(i,t,{step:r===0?2.6:1.7});o.add(d.group);let g=e.chunks??24,x=n/g,p=Array.from({length:g},(P,z)=>new Et("chunk"+z)),m=P=>p[Math.min(g-1,Math.floor((P%n+n)%n/x))],y=Array.from({length:6},()=>new Et("frond")),_=Array.from({length:6},()=>new Et("frondCards")),v=P=>({blades:y[Math.floor((P%n+n)%n/n*6)%6],cards:_[Math.floor((P%n+n)%n/n*6)%6]}),w=Be.half+Be.curbW+Be.walkOut,S=-(Be.half+Be.curbW+Be.walkIn),E=n*.37,A=n*.71,b=n*.12,M=(P,z,ne)=>Math.abs(((P-z+n/2)%n+n)%n-n/2)<ne,R=P=>M(P,E,5)||M(P,A,5)||M(P,b,6),L=[],U={},V=P=>(s()-.5)*P;for(let P=0;P<n;P+=2.6){if(R(P+1.3))continue;let z=l(P,w-.24,{}),ne=l(P+2.6,w-.24,{});jp(m(P),[z.x,z.z],[ne.x,ne.z],z.roadY+Be.curbH)}for(let P=9;P<n;P+=27){if(M(P,E,6))continue;let z=l(P,w-.8,U);Qp(m(P),z.x,z.roadY+Be.curbH,z.z,z.yawSea+Math.PI),L.push(new D(z.x,z.roadY+Be.curbH+3.26,z.z+0))}for(let P=21;P<n;P+=34){let z=l(P,w-1.45,U);e0(m(P),z.x,z.roadY+Be.curbH,z.z,z.yawSea)}for(let P=5;P<n;P+=16.5){if(P+=V(3),M(P,E,11)||M(P,A,7)||s()<.2)continue;let z=l(P,w+2.6+s()*1.6,U);Hh(m(P),z.x,z.y,z.z,s,v(P))}for(let P=11;P<n;P+=22.5){let z=l(P+V(4),S-4.2-s()*4,U);Hh(m(P),z.x,z.y,z.z,s,{h:5+s()*3,...v(P)})}for(let P=29;P<n;P+=41){let z=l(P+V(6),S-9-s()*15,U);zh(m(P),z.x,z.y,z.z,s)}for(let P=3;P<n;P+=5.2){if(s()<.5)continue;let z=l(P+V(2),S-1.3-s()*5.5,U);Vh(m(P),z.x,z.y,z.z,s,{big:s()<.3})}for(let P=6;P<n;P+=7.5){if(s()<.45)continue;let z=l(P+V(3),S-.5-s()*2.4,U);Jp(m(P),z.x,z.y,z.z,s)}for(let P=17;P<n;P+=38){if(P+=V(5),M(P,E,12)||M(P,A,8))continue;let z=l(P,w+6+s()*5,U);if(!(z.y<.35||z.y>2.4)&&(t0(m(P),z.x,z.y,z.z,s),s()<.6)){let ne=l(P+2.5,w+5+s()*5,{});ne.y>.3&&n0(m(P),ne.x,ne.y,ne.z,s)}}for(let P=48;P<n;P+=96){let z=l(P,S+.75,U);r0(m(P),z.x,z.roadY+Be.curbH,z.z,z.yawFwd,{back:s()<.5})}for(let P=63;P<n;P+=87){let z=l(P,S-7.5-s()*3,U);o0(m(P),z.x,z.y,z.z,s()*He)}for(let P of[.55,.86]){let z=l(n*P,S-13-s()*3,U);a0(m(n*P),z.x,z.y,z.z,s()*He,{color:P>.7?_e.sky:_e.coral})}for(let P of[.19,.52,.8]){let z=l(n*P,w+9+s()*3,U);z.y>.2&&s0(m(n*P),z.x,z.y+.25,z.z,s()*He)}{let P=l(A,w+6.2,U);i0(m(A),P.x,P.y,P.z,P.yawSea)}let X=p.map((P,z)=>{let ne=P.build(i);return ne.name="chunk"+z,o.add(ne),ne});for(let[P,z]of y.entries()){let ne=z.build(i);ne.name="frond"+P,ne.userData.toonOnly=!0,o.add(ne),X.push(ne)}let $=yp();for(let[P,z]of _.entries()){let ne=z.build(i,{outline:!1,map:$});ne.name="frondCards"+P,ne.userData.realOnly=!0,ne.userData.alphaCard=!0,ne.visible=!1,o.add(ne),X.push(ne)}let K=0;for(let P of X)K+=P.geometry.index.count/3;let O=t.bounds,j={},J={y:-1};for(let P=1;P<36;P++)for(let z=1;z<36;z++){let ne=O.minX+(O.maxX-O.minX)*P/36,k=O.minZ+(O.maxZ-O.minZ)*z/36,ue=ii(t,ne,k,j);j.u<-20&&ue>J.y&&(J={y:ue,x:ne,z:k})}let F=c0(i,J.x??0,(J.y??20)-.25,J.z??0);o.add(F.group);{let P=d.dirtPath(l(t.nearest(J.x,J.z,{}).s,S-1.2,{}),{x:J.x,z:J.z},1.8,14270606),z={x:(J.x+P.from.x)/2,z:(J.z+P.from.z)/2},ne=Array.from({length:8},()=>new Et("hill"));for(let k=0;k<70;k++){let ue=O.minX+s()*(O.maxX-O.minX),xe=O.minZ+s()*(O.maxZ-O.minZ),Ie=t.nearest(ue,xe,{});if(Ie.u>-22||Math.hypot(ue-J.x,xe-J.z)<13||Math.abs((ue-z.x)*P.dir.x+(xe-z.z)*P.dir.z)<3.5&&Math.hypot(ue-J.x,xe-J.z)<P.len)continue;let Fe=ii(t,ue,xe,Ie),Je=Math.atan2(xe-(O.minZ+O.maxZ)/2,ue-(O.minX+O.maxX)/2),q=ne[Math.min(7,Math.floor((Je+Math.PI)/He*8))];s()<.42?zh(q,ue,Fe,xe,s):Vh(q,ue,Fe,xe,s,{big:s()<.5})}for(let k of ne){let ue=k.build(i);ue.name="hillTrees",o.add(ue)}}let ie=l(E,w-.2,{}),pe=new D(Math.sin(ie.yawSea),0,Math.cos(ie.yawSea)),ge=u0(i,new D(ie.x,ie.roadY+Be.curbH,ie.z),pe,{len:34});o.add(ge.group);let oe=[],Z=[ge.end.clone(),F.top.clone().add(new D(0,-8,0)),new D((O.minX+O.maxX)/2,6,O.maxZ)];for(let P=0;P<(r===0?4:8);P++){let z=h0(i);o.add(z.group),oe.push({g:z,home:Z[P%3].clone().add(new D((s()-.5)*30,0,(s()-.5)*30)),r:12+s()*22,h:6+s()*16,w:(.18+s()*.12)*(s()<.5?-1:1),a:s()*He,scare:0,k:0,lift:0,glideT:s()*6})}let ee=[];for(let P of[.08,.27,.46,.66,.9]){let z=l(n*P,w+24+s()*10,{}),ne=f0(i,P===.46?_e.sun:_e.coral);ne.position.set(z.x,0,z.z),o.add(ne),ee.push(ne)}let ye=[];for(let P of[.31,.78]){let z=l(n*P,w+48+s()*30,{}),ne=new Et("boat");ne.add(di((ue,xe)=>xe.set(0,.3*Math.sin(ue*Math.PI)*.3,-2.4+4.8*ue),ue=>({a:.95*Math.pow(Math.sin(ue*Math.PI),.55)+.01,bt:.03,bb:.75*Math.pow(Math.sin(ue*Math.PI),.5)+.01}),{rings:16,radial:14}),null,_e.white,{spec:.35}),ne.add(it(.05,.07,6.4,8).translate(0,3.4,.2),null,_e.woodDark,{}),ne.add(nn([[0,0],[0,5.6],[2.6,.2]],.03,{bevel:0}).rotateY(Math.PI/2).translate(-.03,.55,.25),null,_e.cream,{outline:1}),ne.add(nn([[0,0],[0,4.6],[-1.9,.15]],.03,{bevel:0}).rotateY(Math.PI/2).translate(.03,.55,.35),null,_e.coral,{outline:1});let k=ne.build(i);k.position.set(z.x,0,z.z),k.rotation.y=s()*He,o.add(k),ye.push({m:k,ph:s()*6,yaw:k.rotation.y})}let Ee=Yh(.62),Te=[];for(let P=0;P<5;P++){let z=Ee.build(i);z.visible=!1,z.name="fish"+P,o.add(z),Te.push({m:z,on:!1,t:0,p0:pi(),d:pi(),h:0,dur:1,pos:pi()})}let Ae=new at;Ae.name="fx",o.add(Ae);let Re=new To(.84,1,40).rotateX(-Math.PI/2),N=Mt(.05,8,6),fe=Array.from({length:10},()=>{let P=new $e(Re,lc(i,16777215,{opacity:0}));return P.visible=!1,Ae.add(P),{m:P,on:!1,t:0,life:1,s0:1}}),le=Array.from({length:22},()=>{let P=new $e(N,lc(i,16777215,{opacity:0}));return P.visible=!1,Ae.add(P),{m:P,on:!1,v:pi(),t:0}}),ce=Array.from({length:10},()=>{let P=new $e(N,lc(i,15985366,{opacity:0}));return P.visible=!1,Ae.add(P),{m:P,on:!1,v:pi(),t:0}}),de=new we(1,1,1),Y={onSplash:null},G=!1,H=[0,1,2].map(()=>({pos:pi(),dir:pi(),color:new we(1,.92,.7),cosInner:.93,cosOuter:.8,range:0,intensity:0})),se=pi(),me=pi(),I=0,T=0,W=r,te=new An(new D(0,1,0),0),ve={group:o,track:t,sea:f,sky:c,terrain:d,lighthouse:F,pier:ge,lightsOut:H,hooks:Y,fxGroup:Ae,landmarks:{lighthouse:F.top.clone(),pier:ge.end.clone(),pierStart:new D(ie.x,ie.roadY+Be.curbH,ie.z)},stats(){return{chunks:g,triangles:Math.round(K),gulls:oe.length}},applyPalette(P){let z=P.sunAz*ni,ne=P.sunEl*ni,k=Math.cos(ne);se.set(Math.sin(z)*k,Math.sin(ne),Math.cos(z)*k).normalize(),me.copy(c.uniforms.uMoonDir.value),c.applyPalette(P,se),f.applyPalette(P,se,me),d.applyPalette(P),u.applyPalette(P),h.applyPalette(P),de.setRGB(...P.seaFoam).convertSRGBToLinear()},setQuality(P){W=P;for(let z of X)z.castShadow=P>=1;G&&f.setQuality(P)},enableReal(P){G=!0,d.enableReal(P),c.enableReal(P.K),f.enableReal(P,P.renderer),P.postHide.push(Ae),P.onLook.push(z=>{c.applyReal(z,Br),f.applyReal(z)}),P.onStyle.push(z=>{u.group.visible=!z}),f.setQuality(W)},renderReflection(P,z){f.renderReflection(P,z,[f.mesh,Ae])},hitSea(P){let z=pi();return!P.ray.intersectPlane(te,z)||z.lengthSq()>900*900||ii(t,z.x,z.z)>-.3?null:(z.y=Vr(z.x,z.z,T,8),{point:z})},splash(P,z=1){for(let k of fe)if(!k.on){k.on=!0,k.t=0,k.life=1.5,k.s0=.35+z*.3,k.m.position.copy(P),k.m.visible=!0;break}let ne=0;for(let k of le)if(!k.on&&ne<6+z*6){ne++,k.on=!0,k.t=0,k.m.visible=!0,k.m.position.copy(P);let ue=s()*He,xe=(.8+s()*1.6)*z;k.v.set(Math.cos(ue)*xe,2.6+s()*3.2*z,Math.sin(ue)*xe),k.m.scale.setScalar(.6+s()*.9)}Y.onSplash&&Y.onSplash(z)},fishJump(P){let z=Te.find(k=>!k.on);if(!z)return null;let ne=s()*He;return z.on=!0,z.t=0,z.dur=1.15+s()*.25,z.h=.95+s()*.5,z.p0.copy(P),z.d.set(Math.cos(ne),0,Math.sin(ne)).multiplyScalar(2.6+s()*1.6),z.m.visible=!0,z.m.position.copy(P),ve.splash(P,.55),{position:z.pos,get t(){return z.t},get alive(){return z.on}}},dust(P,z=1){let ne=0;for(let k of ce)if(!k.on&&ne<3+z*4){ne++,k.on=!0,k.t=0,k.m.visible=!0,k.m.position.copy(P).add(Qs.set((s()-.5)*.5,.05,(s()-.5)*.5));let ue=s()*He;k.v.set(Math.cos(ue)*1.3,.5+s()*.9,Math.sin(ue)*1.3)}},gullFlock:{scatter(P){for(let z of oe)z.g.group.position.distanceTo(P)<55&&(z.scare=Math.max(z.scare,1))},nearCount(P,z=55){let ne=0;for(let k of oe)k.g.group.position.distanceTo(P)<z&&ne++;return ne}},spot:l,randomSeaPoint(P,z=new D){let ne=l(P+(Math.random()-.3)*24,w+11+Math.random()*12,{});return z.set(ne.x,0,ne.z)},update(P,z){T=z.time??T+P;let ne=z.heroPos;I=z.lampLevel??0,c.update(T,z.camera),u.update(P),F.update(P,{lampLevel:I});for(let k of ee)k.position.y=Vr(k.position.x,k.position.z,T,8)+.02;for(let k of ye)k.m.position.y=Vr(k.m.position.x,k.m.position.z,T,8)*.8,k.m.rotation.set(Math.sin(T*.9+k.ph)*.04,k.yaw+Math.sin(T*.2+k.ph)*.05,Math.sin(T*1.1+k.ph)*.05);for(let k of oe){k.scare=Math.max(0,k.scare-P/6.5),k.k=pn(k.k,k.scare,10,P);let ue=k.k;k.lift+=ct(12*ue-k.lift,-3*P,3.5*P),k.a+=P*k.w*(1+2.2*ue),k.glideT+=P,k.glideT>5+k.w*97%3&&(k.glideT=-2-k.w*53%3);let xe=k.glideT<0&&k.scare<.1,Ie=k.r*(1+.8*ue),Ge=k.h+k.lift+Math.sin(k.a*2.3)*1.6;Qs.set(Math.cos(k.a)*Ie,Ge,Math.sin(k.a)*Ie).add(k.home),y0.set(Math.cos(k.a+.08)*Ie,Ge+Math.cos(k.a*2.3)*.35,Math.sin(k.a+.08)*Ie).add(k.home),k.g.group.position.copy(Qs),k.g.group.lookAt(y0),k.g.group.rotateZ(-.35*Math.sign(k.w)*(1+ue)),k.g.update(T,{flapping:!xe})}for(let k of Te){if(!k.on)continue;if(k.t+=P/k.dur,k.t>=1){k.on=!1,k.m.visible=!1,ve.splash(k.m.position,.9);continue}let ue=k.t;Qs.copy(k.p0).addScaledVector(k.d,ue),Qs.y=k.h*Math.sin(Math.PI*ue)*1.6-.1,k.m.position.copy(Qs),k.pos.copy(Qs);let xe=k.h*Math.PI*Math.cos(Math.PI*ue)*1.6/k.dur,Ie=k.d.length()/k.dur;k.m.rotation.set(0,Math.atan2(k.d.x,k.d.z),0),k.m.rotateX(-Math.atan2(xe,Ie)),k.m.rotateZ(Math.sin(ue*38)*.25)}for(let k of fe)if(k.on){if(k.t+=P/k.life,k.t>=1){k.on=!1,k.m.visible=!1;continue}let ue=(k.s0+k.t*2.6)*1;k.m.scale.set(ue,1,ue),k.m.material.uniforms.uOpacity.value=(1-k.t)*.85,k.m.material.uniforms.uColor.value.copy(de),k.m.position.y=Vr(k.m.position.x,k.m.position.z,T,8)+.05}for(let k of le)if(k.on){k.t+=P,k.v.y-=9.81*P,k.m.position.addScaledVector(k.v,P);let ue=.85;if(k.t>ue||k.v.y<0&&k.m.position.y<Vr(k.m.position.x,k.m.position.z,T,8)){k.on=!1,k.m.visible=!1;continue}k.m.material.uniforms.uOpacity.value=1-k.t/ue}for(let k of ce)if(k.on){if(k.t+=P,k.v.multiplyScalar(1-P*2.2),k.v.y+=P*.3,k.m.position.addScaledVector(k.v,P),k.t>.75){k.on=!1,k.m.visible=!1;continue}let ue=1.6+k.t*6;k.m.scale.set(ue,ue*.8,ue),k.m.material.uniforms.uOpacity.value=(1-k.t/.75)*.55}if(H[0].range=I>.02?260:0,H[0].pos.copy(F.lampPos),H[0].dir.copy(F.lightDir),H[0].intensity=.5*I,I>.02&&ne){let k=L.map(ue=>({p:ue,d:ue.distanceToSquared(ne)})).filter(ue=>ue.d<4900).sort((ue,xe)=>ue.d-xe.d).slice(0,2);for(let ue=0;ue<2;ue++){let xe=H[1+ue],Ie=k[ue]?.p;Ie?(xe.pos.copy(Ie),xe.dir.set(0,-1,0),xe.range=10.5,xe.intensity=.96*I,xe.cosInner=.2,xe.cosOuter=-1,xe.color.setRGB(1,.84,.56)):xe.range=0}}else H[1].range=0,H[2].range=0;for(let k=0;k<3;k++){let ue=H[k],xe=k+1;i.uLightsPos.value[xe].copy(ue.pos),i.uLightsDir.value[xe].copy(ue.dir),i.uLightsColor.value[xe].copy(ue.color),i.uLightsParam.value[xe].set(ue.cosInner,ue.cosOuter,ue.intensity,ue.range)}}};return ve}var M0=(i,e,t=[0,0,0])=>(t[0]=i[0]-e[0],t[1]=i[1]-e[1],t[2]=i[2]-e[2],t);var S0=(i,e)=>i[0]*e[0]+i[1]*e[1]+i[2]*e[2];var Zh=i=>Math.hypot(i[0],i[1],i[2]);var Kh=(i,e=[0,0,0])=>{let t=Zh(i);return t<1e-9?(e[0]=0,e[1]=0,e[2]=0,e):(e[0]=i[0]/t,e[1]=i[1]/t,e[2]=i[2]/t,e)};function $h(i,e,t,n,s,r=[0,0,0]){let o=M0(e,i),a=Zh(o),l=(t+n)*.9995,c=Math.abs(t-n)+1e-4,u=a<=l&&a>=c;if(a<1e-6)return r[0]=i[0],r[1]=i[1],r[2]=i[2]+1e-6,{joint:r,reached:!1,target:e.slice(),end:e.slice()};let h=Math.min(Math.max(a,c),l),f=Kh(o),d=(t*t-n*n+h*h)/(2*h),g=Math.sqrt(Math.max(t*t-d*d,0)),x=Math.min(Math.max(S0(s,f),-1),1),p=Kh([s[0]-f[0]*x,s[1]-f[1]*x,s[2]-f[2]*x]);r[0]=i[0]+f[0]*d+p[0]*g,r[1]=i[1]+f[1]*d+p[1]*g,r[2]=i[2]+f[2]*d+p[2]*g;let m=u?e.slice():[i[0]+f[0]*h,i[1]+f[1]*h,i[2]+f[2]*h];return{joint:r,reached:u,target:e.slice(),end:m}}function b0(i={}){let e=i.cols??3,t=i.rows??16,n=e*t;return{cols:e,rows:t,n,x:new Float64Array(n*3),p:new Float64Array(n*3),inv:new Float64Array(n).fill(1),rest:new Float64Array(n*4),rest2:new Float64Array(n),bendK:.35,acc:0,seg:0,across:0}}var Ji=(i,e,t)=>e*i.cols+t;function E0(i,e,t,n,s,r){i.seg=s/(i.rows-1),i.across=r/(i.cols-1);for(let o=0;o<i.rows;o++)for(let a=0;a<i.cols;a++){let l=Ji(i,o,a),c=(a-(i.cols-1)/2)*i.across,u=o*i.seg;i.x[l*3]=i.p[l*3]=e[0]+t[0]*u+n[0]*c,i.x[l*3+1]=i.p[l*3+1]=e[1]+t[1]*u+n[1]*c,i.x[l*3+2]=i.p[l*3+2]=e[2]+t[2]*u+n[2]*c;let h=o<i.rows-1?i.seg:-1,f=a<i.cols-1?i.across:-1,d=Math.hypot(i.seg,i.across);i.rest[l*4]=h,i.rest[l*4+1]=f,i.rest[l*4+2]=o<i.rows-1&&a<i.cols-1?d:-1,i.rest[l*4+3]=o<i.rows-1&&a>0?d:-1,i.rest2[l]=o<i.rows-2?i.seg*2:0}return i.acc=0,i}var na=1/120,Ic=[0,0,0];function T0(i,e,t={}){i.acc+=Math.min(e,.1);let n=t.gravity??9.81,s=t.damp??.012,r=t.iter??4,o=t.wind,a=t.pin,l=t.spheres,c=t.t??0,u=0;for(;i.acc>=na&&u<5;){if(i.acc-=na,u++,a)for(let d=0;d<i.cols;d++){let g=a(0,d);if(!g)continue;let x=Ji(i,0,d);i.x[x*3]=i.p[x*3]=g[0],i.x[x*3+1]=i.p[x*3+1]=g[1],i.x[x*3+2]=i.p[x*3+2]=g[2],i.inv[x]=0}let h=na*na,f=1-s;for(let d=0;d<i.n;d++){if(i.inv[d]===0)continue;let g=d*3,x=0,p=-n,m=0;o&&(o(i.x[g],i.x[g+1],i.x[g+2],c,Ic),x+=Ic[0],p+=Ic[1],m+=Ic[2]);let y=i.x[g]+(i.x[g]-i.p[g])*f+x*h,_=i.x[g+1]+(i.x[g+1]-i.p[g+1])*f+p*h,v=i.x[g+2]+(i.x[g+2]-i.p[g+2])*f+m*h;i.p[g]=i.x[g],i.p[g+1]=i.x[g+1],i.p[g+2]=i.x[g+2],i.x[g]=y,i.x[g+1]=_,i.x[g+2]=v}for(let d=0;d<r;d++){if(i.bendK>0)for(let g=0;g<i.n;g++){let x=i.rest2[g];if(x<=0)continue;let p=g+2*i.cols,m=i.inv[g],y=i.inv[p];if(m+y===0)continue;let _=i.x[p*3]-i.x[g*3],v=i.x[p*3+1]-i.x[g*3+1],w=i.x[p*3+2]-i.x[g*3+2],S=Math.hypot(_,v,w)||1e-9,E=(S-x)/S/(m+y)*i.bendK;i.x[g*3]+=_*E*m,i.x[g*3+1]+=v*E*m,i.x[g*3+2]+=w*E*m,i.x[p*3]-=_*E*y,i.x[p*3+1]-=v*E*y,i.x[p*3+2]-=w*E*y}for(let g=0;g<i.n;g++){let x=g*4,p=i.rest[x],m=i.rest[x+1],y=i.rest[x+2],_=i.rest[x+3];for(let v=0;v<4;v++){let w=v===0?p:v===1?m:v===2?y:_;if(w<0)continue;let S=v===0?g+i.cols:v===1?g+1:v===2?g+i.cols+1:g+i.cols-1,E=i.inv[g],A=i.inv[S];if(E+A===0)continue;let b=i.x[S*3]-i.x[g*3],M=i.x[S*3+1]-i.x[g*3+1],R=i.x[S*3+2]-i.x[g*3+2],L=Math.hypot(b,M,R)||1e-9,U=(L-w)/L/(E+A),V=b*U,X=M*U,$=R*U;i.x[g*3]+=V*E,i.x[g*3+1]+=X*E,i.x[g*3+2]+=$*E,i.x[S*3]-=V*A,i.x[S*3+1]-=X*A,i.x[S*3+2]-=$*A}}if(l&&l.length){for(let g=0;g<i.n;g++)if(i.inv[g]!==0)for(let x=0;x<l.length;x+=4){let p=i.x[g*3]-l[x],m=i.x[g*3+1]-l[x+1],y=i.x[g*3+2]-l[x+2],_=l[x+3],v=p*p+m*m+y*y;if(v<_*_&&v>1e-12){let w=(_-Math.sqrt(v))/Math.sqrt(v);i.x[g*3]+=p*w,i.x[g*3+1]+=m*w,i.x[g*3+2]+=y*w}}}}c+=na}return u===5&&(i.acc=0),i}function w0(i,e,t,n,s,r,o=1){let a=hc(e*2.1+t*1.3+n*2,11),l=hc(e*3.3+s*1.7,23),c=hc(e*1.7+n*3.1,37),u=(.25+i*.16)*o;return r[0]=a*u*.7,r[1]=l*u*.9+1.6+i*.9,r[2]=-Math.min(i,14)*2.4*(1+.15*c)*o,r}var Ot=Object.freeze({feather:16249574,primary:3881551,beak:15895596,pouch:16371590,nail:14241838,mouth:8005168,eyeWhite:16776693,eyeDark:2564400,skin:16172395,leg:15764028,scarf:6079406,strap:3882314}),Jt=Object.freeze({bodyCenter:[0,1.19,-.12],spineFront:[0,1.1,.22],spineBack:[0,1.33,-.66],neckBase:[0,1.28,.12],headCenter:[0,2.045,.455],headRadii:[.152,.15,.168],neckAttach:[0,-.085,-.07],jawPivot:[0,-.05,.115],upper:[[0,-.045,.125],[0,-.07,.335],[0,-.1,.535],[0,-.13,.685],[0,-.16,.742],[0,-.178,.752]],lower:[[0,-.108,.02],[0,-.062,.15],[0,-.086,.345],[0,-.114,.545],[0,-.142,.692],[0,-.168,.748]]}),ht=(i=0,e=0,t=0)=>new D(i,e,t),Dc=ht(0,1,0),_w=ht(0,-1,0),tM=ht(0,0,1),Ii=ht(1,0,0),ia=ht(),Lc=ht(),Jh=ht(),A0=ht(),si=ht(),ys=[0,0,0],Fc={spec:.22,specSize:.7},nM=[0,1.24,-.26,.33,.09,1.62,.11,.085,-.09,1.62,.11,.085],iM=[0,.05,.12,.2,.3,.5,.7,.8,.88,.95,1],sM=[.02,.62,.9,1,1,1,1,1,.9,.62,.02];function rM(i,e,t=1){return n=>{let s=st(i,e,n)*Mi(iM,sM,n);return{a:s*t,bt:s,bb:s}}}var R0=(i,e)=>(t,n)=>n.set(st(i.x,e.x,t),st(i.y,e.y,t),st(i.z,e.z,t));function sa(i,e,t,n={}){let s=new $e(e.geometry,_t(i,t,n));return s.castShadow=!0,s.receiveShadow=!0,s.frustumCulled=!1,Or(s,i,{px:n.outline??1.2,useNormals:!0}),s}function Nc(i,e,t,n={},s=1.3){let r=new $e(e,_t(i,t,n));return r.castShadow=!0,r.receiveShadow=!0,Or(r,i,{px:s,useNormals:!0}),r}var oM=null,C0=()=>oM||={helmet:kp(),scarf:zp()},Uc=(i,e,t=.01,n={})=>nn(Rp(i,e,{tip:n.tip??.8,belly:n.belly??.7,n:12}),t,{bevel:t*.35});function P0(i,e){let t=new at;t.name=e>0?"handL":"handR";let n=new Et("hand"),s=ht(.877*e,-.13,-.45).normalize();n.add(ea(.05,.046,.056,18,12),new qe().makeTranslation(s.x*.018,.004,.004),Ot.primary,{spec:.3,outline:1.1});for(let r=0;r<4;r++){let o=-.024+r*.024,a=s.clone().multiplyScalar(o),l=[];for(let c=0;c<=6;c++){let u=.25+c/6*2.75;l.push([a.x+e*.004*c,.004+.036*Math.cos(u),.004+.036*Math.sin(u)+(c>4?(c-4)*.014:0)])}n.add(gn(l,.0105-r*6e-4,{tubular:14,radial:7}).scale(1.25,1,1),null,Ot.primary,{spec:.3,outline:.9})}return t.add(n.build(i)),t}function jh(i,e={}){let t=new at;t.name="pelican";let n=Jt.bodyCenter,s=G=>ht(G[0]-n[0],G[1]-n[1],G[2]-n[2]),r={beak:e.beak??1,pouch:e.pouch??1,neck:e.neck??1,body:e.body??1},o=[Jt.headCenter[0],Jt.headCenter[1]+(r.neck-1)*.82,Jt.headCenter[2]],a=G=>G.map(H=>[H[0],H[1],Jt.jawPivot[2]+(H[2]-Jt.jawPivot[2])*r.beak]),l=a(Jt.upper),c=a(Jt.lower),u=G=>G.map(H=>H*r.body),h=new at;h.name="body",h.position.set(n[0],n[1],n[2]),t.add(h);let f={t:[0,.05,.14,.3,.5,.7,.86,.96,1],a:u([.004,.165,.25,.3,.31,.27,.2,.095,.004]),bt:u([.004,.175,.27,.32,.33,.3,.22,.1,.004]),bb:u([.004,.19,.3,.36,.37,.32,.22,.09,.004])},d=di((G,H)=>H.set(0,st(Jt.spineFront[1],Jt.spineBack[1],G)-n[1],st(Jt.spineFront[2],Jt.spineBack[2],G)-n[2]),G=>({a:Mi(f.t,f.a,G),bt:Mi(f.t,f.bt,G),bb:Mi(f.t,f.bb,G)}),{rings:40,radial:40,ref:Ii}),g=Nc(i,d,Ot.feather,Fc,1.35);g.name="bodyMesh",h.add(g);{let G=new Et("tail");for(let H=-2;H<=2;H++){let se=H*.24,me=.27-Math.abs(H)*.02,I=Uc(me,.078-Math.abs(H)*.008,.014);I.rotateX(-Math.PI/2+.5),I.rotateY(se),I.translate(Math.sin(se)*.03,.15+(2-Math.abs(H))*.004,-.52),G.add(I,null,Ot.feather,{outline:1})}for(let H=-1;H<=1;H++){let se=Uc(.15-Math.abs(H)*.02,.075,.016);se.rotateX(-Math.PI/2+.74),se.rotateY(H*.16),se.translate(H*.025,.14,-.43),G.add(se,null,Ot.feather,{outline:1})}h.add(G.build(i))}let x={t:[0,.15,.35,.6,.85,1],r:[.172,.138,.118,.104,.098,.1]},p=new $i({rings:36,radial:26,caps:[!1,!1]});p.setProfile(G=>{let H=Mi(x.t,x.r,G);return{a:H*.92,bt:H*1.04,bb:H*1.04}});let m=sa(i,p,Ot.feather,{...Fc,outline:1.3});m.name="neck",t.add(m);let y=new at;y.name="head",t.add(y);let _=Nc(i,ea(Jt.headRadii[0],Jt.headRadii[1],Jt.headRadii[2],36,26),Ot.feather,Fc,1.35);_.name="skull",y.add(_);let v=ht(.93,.19,.33).normalize(),w=[];for(let G of[1,-1]){let H=ht(v.x*G,v.y,v.z),se=ht(H.x*Jt.headRadii[0],H.y*Jt.headRadii[1],H.z*Jt.headRadii[2]).addScaledVector(H,.004),me=new at;me.position.copy(se),me.name=G>0?"eyeL":"eyeR",y.add(me);let I=Dc.clone().addScaledVector(H,-Dc.dot(H)).normalize(),T=ht().crossVectors(I,H).normalize(),W=new qe().makeBasis(T,I,H),te=new $e(Mt(.058,18,12),_t(i,Ot.skin,{spec:.2}));te.scale.set(1,1,.26),te.position.copy(H).multiplyScalar(-.044),te.quaternion.setFromRotationMatrix(W),me.add(te),me.add(Nc(i,Mt(.04,20,14),Ot.eyeWhite,{spec:1,specSize:.42},1.1));let ve=new $e(Mt(.0285,18,12),_t(i,Ot.eyeDark,{spec:1,specSize:.3}));ve.position.copy(H).multiplyScalar(.019),me.add(ve);let P=new $e(Mt(.0095,10,8),_t(i,16777215,{emissive:16777215,emissiveLevel:.9,pbr:"hide"}));P.position.copy(H).multiplyScalar(.0405).add(ht(0,.013,.013)),me.add(P);let z=new $e(Mt(.0428,20,10,0,He,0,1.5),_t(i,Ot.feather,Fc));z.castShadow=!1;let ne=new at;ne.add(z),me.add(ne);let k=new $e(fi(.049,.006,6,20,1.9),_t(i,Ot.primary,{spec:.2})),ue=new at;ue.position.copy(H).multiplyScalar(.004),ue.quaternion.setFromRotationMatrix(W),ue.rotation.z=Math.PI/2-.95+G*.07,ue.add(k),me.add(ue),w.push({side:G,n:H,lidPivot:ne,pupil:ve,ex:T,ey:I})}{let G=new $e(Mt(1,40,18,0,He,0,1.05),_t(i,16777215,{map:C0().helmet,spec:.55,specSize:.5,pbr:"carpaint"}));G.scale.set(.163,.148,.178),G.position.set(0,.04,-.025),G.castShadow=!0,G.name="helmet",y.add(G),Or(G,i,{px:1.35,useNormals:!0});let H=new Et("helmetTrim");H.add(fi(.163*Math.sin(1.05),.009,8,48).rotateX(Math.PI/2).scale(1,1,.178/.163).translate(0,.04+.148*Math.cos(1.05),-.025),null,14240829,{spec:.4});for(let me of[1,-1])H.add(gn([[me*.138,.105,-.02],[me*.145,.03,-.045],[me*.115,-.065,-.075],[me*.07,-.125,-.105]],.0055,{tubular:16,radial:7}),null,Ot.strap,{outline:.7});y.add(H.build(i));let se=new Et("crest");for(let me=0;me<4;me++){let I=Uc(.1+me%2*.025,.024,.008,{tip:.9});I.rotateX(-Math.PI/2-.3-me*.07),I.translate((me-1.5)*.024,.035-me*.004,-.15),se.add(I,null,Ot.feather,{outline:.9})}y.add(se.build(i))}let S={t:[0,.25,.55,.8,.95,1],a:[.05,.046,.04,.027,.013,.002],bt:[.03,.025,.019,.012,.01,.002]},E={t:[0,.12,.28,.45,.62,.78,.9,1],bb:[.07,.145,.175,.165,.13,.082,.04,.003].map(G=>G*r.pouch)},A={t:[0,.12,.35,.6,.85,1],a:[.034,.05,.05,.041,.02,.003]},b={open:-1,pouch:-1},M=new $i({rings:30,radial:24});M.setSection((G,H,se)=>{let me=Math.cos(H),I=Math.sin(H),T=Mi(S.t,S.a,G),W=Mi(S.t,S.bt,G),te=st(.006,.002,G);I>=0?(se.u=T*me*(1-.3*I),se.v=W*Math.pow(I,.72)):(se.u=T*me,se.v=te*I)});let R=sa(i,M,Ot.beak,{spec:.5,specSize:.55,outline:1.2,pbr:"beak"});R.name="beakUpper",y.add(R);{let G=R.geometry,H=G.attributes.position.count,se=new Float32Array(H*3),me=new we(Ot.beak),I=new we(Ot.nail),T=G.attributes.uv;for(let W=0;W<H;W++){let te=kn(.9,.955,T.getY(W));se[W*3]=st(me.r,I.r,te),se[W*3+1]=st(me.g,I.g,te),se[W*3+2]=st(me.b,I.b,te)}G.setAttribute("color",new Ze(se,3)),R.material.vertexColors=!0,R.material.uniforms.uColor.value.set(16777215),R.material.needsUpdate=!0}let L=new $i({rings:32,radial:24}),U=sa(i,L,Ot.pouch,{spec:.35,specSize:.7,outline:1.35});U.name="pouch",y.add(U);let V=new $i({rings:20,radial:16,caps:[!1,!1]}),X=sa(i,V,Ot.mouth,{outline:0});X.name="mouth",X.castShadow=!1,y.add(X);let $=ht(...Jt.jawPivot),K=new Ai(l.map(G=>ht(...G)),!1,"centripetal"),O=new Ai(c.map(G=>ht(...G)),!1,"centripetal"),j=(G,H)=>(se,me)=>{G.getPoint(se,me),me.sub($).applyAxisAngle(Ii,H).add($)};function J(G,H){if(G=wt(G),H=ct(H,.4,1.8),Math.abs(G-b.open)<.004&&Math.abs(H-b.pouch)<.004)return;b.open=G,b.pouch=H,M.update(j(K,-G*.3),Ii),L.setProfile(me=>({a:Mi(A.t,A.a,me)*(.85+.15*H),bt:st(.0075,.002,me),bb:Math.max(.002,Mi(E.t,E.bb,me)*H)})),L.update(j(O,G*.46),Ii);let se=G*.76;V.setProfile(me=>({a:Mi(A.t,A.a,me)*.9,bt:Math.max(.001,se*.62*me-.006),bb:.004})),V.update(j(O,G*.46),Ii)}J(0,1);let F=(G,H,se,me=1)=>{let I=new $i({rings:16,radial:18});I.setProfile(rM(G,H,me));let T=sa(i,I,se,{spec:.24,specSize:.7,outline:1.15});return t.add(T),{loft:I,mesh:T}},ie={},pe={};for(let G of[1,-1]){let H=G>0?"L":"R";ie["thigh"+H]=F(.105,.064,Ot.feather),ie["shin"+H]=F(.042,.031,Ot.leg),ie["upperArm"+H]=F(.1,.062,Ot.feather,.74),ie["foreArm"+H]=F(.06,.04,Ot.feather,.78);let se=new Et("elbowFeathers");for(let I=-1;I<=1;I++){let T=Uc(.17-Math.abs(I)*.028,.052,.016,{tip:.6});T.rotateX(Math.PI/2),T.rotateY(I*.24),se.add(T,null,Ot.primary,{spec:.25,outline:1})}let me=new at;me.name="elbow"+H,me.add(se.build(i)),me.quaternion.setFromRotationMatrix(new qe().makeBasis(ht(0,.34,-.94),ht(1,0,0),ht(0,-.94,-.34))),t.add(me),pe[H]=me}let ge=Nc(i,fi(.126,.026,10,32).scale(1,1,.78),Ot.scarf,{spec:.2},1.1);ge.name="collar",t.add(ge);let oe=C0().scarf,Z=[];for(let G=0;G<2;G++){let H=b0({cols:3,rows:15});E0(H,[.04+G*.05,1.47,0],[0,0,-1],[1,0,0],.62-G*.1,.085);let se=new ft,me=[];for(let W=0;W<H.rows-1;W++)for(let te=0;te<H.cols-1;te++){let ve=Ji(H,W,te),P=Ji(H,W,te+1),z=Ji(H,W+1,te),ne=Ji(H,W+1,te+1);me.push(ve,P,z,P,ne,z)}let I=new Float32Array(H.n*2);for(let W=0;W<H.rows;W++)for(let te=0;te<H.cols;te++)I[Ji(H,W,te)*2]=te/(H.cols-1),I[Ji(H,W,te)*2+1]=1-W/(H.rows-1);se.setAttribute("position",new Ze(new Float32Array(H.n*3),3).setUsage(Yi)),se.setAttribute("uv",new Ze(I,2)),se.setIndex(me);let T=new $e(se,_t(i,16777215,{map:oe,side:Wt,spec:.1,pbr:"fabric"}));T.castShadow=!0,T.frustumCulled=!1,T.name="scarf"+G,t.add(T),Z.push({cloth:H,mesh:T})}let ee=ht(...o),ye=ht(),Ee=ht(-.05,0,0),Te=ht(),Ae=vh(1),Re=vh(1),N={blinkT:1.5,blink:0,mouth:0,t:0,rng:Pn(7),airPrev:!1},fe=[ht(),ht(),ht(),ht(),ht()],le=new Ai(fe,!1,"centripetal"),ce=(G,H,se,me,I,T,W,te)=>{H.x+=((se-G.x)*T-H.x*W)*te,G.x+=H.x*te,H.y+=((me-G.y)*T-H.y*W)*te,G.y+=H.y*te,H.z+=((I-G.z)*T-H.z*W)*te,G.z+=H.z*te},de={hipL:ht(),hipR:ht(),kneeL:ht(),kneeR:ht(),ankleL:ht(),ankleR:ht(),shL:ht(),shR:ht(),elL:ht(),elR:ht(),neckPts:fe};return{root:t,bodyNode:h,headNode:y,eyes:w,neckMesh:m,upperMesh:R,pouchMesh:U,collar:ge,tails:Z,debug:de,limbs:ie,shape:r,get mouth(){return N.mouth},update(G){let{state:H,dt:se}=G,me=N.t+=se,I=H.v,T=wt(Math.abs(H.crankVel)*.28)*(H.air?0:1),W=.1+.11*wt(I/12)-H.accel*.012-(H.air?H.airVy*.03:0),te=.012*Math.sin(2*H.crank)*T,ve=.008*Math.sin(H.crank)*T,P=.03*Math.cos(H.crank)*T;if(H.air&&!N.airPrev&&(Ae.v+=2.6,Re.v+=5),!H.air&&N.airPrev){let At=wt(H.landImpact/4.4);Ae.v-=3.4*At,Re.v-=9*At}N.airPrev=H.air,xh(Ae,1,160,11,se),xh(Re,1,90,5.5,se);let z=Ae.x*(1+.012*Math.cos(2*H.crank)*T),ne=1/Math.sqrt(Math.max(z,.5));h.position.set(n[0]+ve,n[1]+te,n[2]),h.rotation.set(W,0,P),h.scale.set(ne,z,ne),h.updateMatrix();let k=(o[0]-n[0])*ne,ue=(o[1]-n[1])*z,xe=(o[2]-n[2])*ne,Ie=Math.cos(P),Ge=Math.sin(P),We=.008*Math.sin(2*H.crank)*T;ce(ee,ye,n[0]+ve+k*Ie-ue*Ge,n[1]+te+k*Ge+ue*Ie+We,n[2]+xe,150,12,se);let Fe=G.look||{},Je=-W*.5+(Fe.pitch||0)+.006*Math.sin(2*H.crank)*T;ce(Ee,Te,Je,Fe.yaw||0,Fe.roll||0,140,15,se),y.position.copy(ee),y.rotation.set(Ee.x,Ee.y,Ee.z,"YXZ"),y.updateMatrix();let q=Lc.copy(s(Jt.neckBase)).applyMatrix4(h.matrix),Ce=Jh.set(...Jt.neckAttach).applyMatrix4(y.matrix);fe[0].copy(q),fe[1].lerpVectors(q,Ce,.3),fe[1].z+=.05,fe[2].lerpVectors(q,Ce,.63),fe[2].z-=.045,fe[3].lerpVectors(q,Ce,.86),fe[3].y-=.01,fe[3].z+=.01,fe[4].copy(Ce),p.update((At,qt)=>le.getPoint(At,qt),Ii),le.getPoint(.3,ia),le.getTangent(.3,Lc).normalize(),ge.position.copy(ia),ge.quaternion.setFromUnitVectors(tM,Lc);let De=G.anchors;for(let At of[1,-1]){let qt=At>0?"L":"R",Ln=ia.copy(s(ze.hip).setX(At*ze.hip[0])).applyMatrix4(h.matrix),Gn=Lc.copy(At>0?De.pedalL:De.pedalR).add(si.set(At*.105,.072,-.026));$h([Ln.x,Ln.y,Ln.z],[Gn.x,Gn.y,Gn.z],ze.thigh,ze.shin,[At*.22,.05,1],ys);let Fn=Jh.set(ys[0],ys[1],ys[2]);ie["thigh"+qt].loft.update(R0(Ln,Fn),Ii),ie["shin"+qt].loft.update(R0(Fn,Gn),Ii),de["hip"+qt].copy(Ln),de["knee"+qt].copy(Fn),de["ankle"+qt].copy(Gn);let Rt=A0.copy(s(ze.shoulder).setX(At*ze.shoulder[0])).applyMatrix4(h.matrix),sn=At>0?De.gripL:De.gripR;$h([Rt.x,Rt.y,Rt.z],[sn.x,sn.y,sn.z],ze.upperArm,ze.foreArm,[At*.55,-.35,-1],ys);let bi=Rt.x,Ei=Rt.y,Ui=Rt.z;si.set(ys[0],ys[1],ys[2]),ie["upperArm"+qt].loft.update((B,Ne)=>Ne.set(st(bi,si.x,B),st(Ei,si.y,B),st(Ui,si.z,B)),Ii),ie["foreArm"+qt].loft.update((B,Ne)=>Ne.set(st(si.x,sn.x,B),st(si.y,sn.y,B),st(si.z,sn.z,B)),Ii),de["sh"+qt].set(bi,Ei,Ui),de["el"+qt].copy(si),pe[qt].position.set(st(bi,si.x,.9),st(Ei,si.y,.9),st(Ui,si.z,.9))}N.mouth+=((G.mouth||0)-N.mouth)*Math.min(1,se*18),J(N.mouth,Re.x);let ke=0;N.blinkT-=se,N.blinkT<0&&(N.blink=1e-4,N.blinkT=1.8+N.rng()*3.4),N.blink>0&&(N.blink+=se/.17,N.blink>=1?N.blink=0:ke=Math.sin(Math.PI*N.blink));for(let At of w){let qt=st(1.4,.3,ke);ia.copy(Dc).multiplyScalar(Math.sin(qt)).addScaledVector(At.n,Math.cos(qt)).normalize(),At.lidPivot.quaternion.setFromUnitVectors(Dc,ia)}let Pe=le.getTangent(.3,si).normalize(),Se=Jh.set(0,0,-1).addScaledVector(Pe,Pe.z).normalize(),Ve=A0.crossVectors(Pe,Se).normalize(),et=ge.position,St=I+(H.air?.5:0),xt=Se.x,Vn=Se.y,Tn=Se.z,tr=Ve.x,_n=Ve.y,Ni=Ve.z;Z.forEach((At,qt)=>{let Ln=qt===0?-.02:.05;T0(At.cloth,se,{t:me,pin:(Fn,Rt)=>{let sn=(Rt-1)*.04+Ln;return[et.x+xt*.118+tr*sn,et.y+Vn*.118+_n*sn,et.z+Tn*.118+Ni*sn]},wind:(Fn,Rt,sn,bi,Ei)=>w0(St,bi,Fn,Rt,sn,Ei,1),spheres:nM,gravity:5.5,iter:6});let Gn=At.mesh.geometry.attributes.position;Gn.array.set(At.cloth.x.subarray(0,At.cloth.n*3)),Gn.needsUpdate=!0,At.mesh.geometry.computeVertexNormals()})}}}function aM(i){let e=new Set,t=new Set;i.traverse(n=>{n.geometry&&e.add(n.geometry),n.material&&(Array.isArray(n.material)?n.material:[n.material]).forEach(s=>t.add(s))});for(let n of[...t])n.userData?.pbrSibling&&t.add(n.userData.pbrSibling);e.forEach(n=>n.dispose()),t.forEach(n=>n.dispose())}var _s=[0,0,0];function I0(i,e={}){let t=new at;t.name="hero";let n=v0(i,e),s=jh(i);t.add(n.root,s.root);let r=n.steer.parent.quaternion.clone().invert();for(let[l,c]of[[n.gripL,1],[n.gripR,-1]]){let u=P0(i,c);u.quaternion.copy(r),l.add(u)}let o={gripL:new D(ze.grip[0],ze.grip[1],ze.grip[2]),gripR:new D(-ze.grip[0],ze.grip[1],ze.grip[2]),pedalL:new D,pedalR:new D},a={hero:t,bike:n,pelican:s,anchors:o,update(l,c,u={}){n.update(l,c,u),t.updateMatrixWorld(!0),n.gripL.getWorldPosition(o.gripL),t.worldToLocal(o.gripL),n.gripR.getWorldPosition(o.gripR),t.worldToLocal(o.gripR),Wh(1,l.crank,_s),o.pedalL.set(_s[0],_s[1],_s[2]),Wh(-1,l.crank,_s),o.pedalR.set(_s[0],_s[1],_s[2]),s.update({state:l,dt:c,anchors:o,look:u.look,mouth:u.mouth,curvature:u.curvature})},setSculpt(l){t.remove(s.root),aM(s.root),s=jh(i,l),a.pelican=s,t.add(s.root)}};return a.update({wheel:0,crank:Math.PI/2,crankVel:0,v:0,time:0,air:!1,accel:0,airVy:0,landImpact:0},.016,{}),a}var lM=new qe,D0=new D,L0=new D,F0=new D,cM=9.81;function N0(i,e,t,n,s){e.frameAt(t,s),i.position.set(s.pos[0],s.pos[1]+(n.airY||0),s.pos[2]),D0.set(-s.right[0],0,-s.right[2]),L0.set(s.up[0],s.up[1],s.up[2]),F0.set(s.fwd[0],s.fwd[1],s.fwd[2]),i.quaternion.setFromRotationMatrix(lM.makeBasis(D0,L0,F0));let r=-Math.atan((n.speed||0)**2*(n.curvature||0)/cM)*.85;return i.rotateZ(r),n.jumpPitch&&i.rotateX(n.jumpPitch),s}var Di=Object.freeze([{id:"follow",label:"\u8DDF\u62CD",hint:"\u62D6\u52A8\u73AF\u7ED5\uFF0C\u6EDA\u8F6E\u8FDC\u8FD1"},{id:"side",label:"\u4FA7\u8DDF",hint:"\u4ECE\u6D77\u9762\u4E00\u4FA7\u5E73\u79FB\u8DDF\u968F"},{id:"close",label:"\u7279\u5199",hint:"\u8D34\u8FD1\u9E48\u9E55\u7684\u5934\u548C\u5599"},{id:"orbit",label:"\u73AF\u7ED5",hint:"\u7ED5\u7740\u9A91\u624B\u6162\u6162\u8F6C\u5708"},{id:"director",label:"\u5BFC\u6F14",hint:"\u81EA\u52A8\u5207\u6362\u673A\u4F4D\uFF0C\u50CF\u4E00\u6BB5\u77ED\u7247"},{id:"pov",label:"\u9E48\u9E55\u89C6\u89D2",hint:"\u4ECE\u9E48\u9E55\u7684\u773C\u775B\u5F80\u524D\u770B"}]),Gr=["tripod","lowFront","rearWide","seaLong","topDown","wheel","front34"],Qh=new D,U0=new D,ri=new D,er=new D;function O0(i,e={}){let t={i:0,az:0,el:0,dist:1,idle:99,pos:new D,tgt:new D,fov:36,shot:null,shotT:0,last:"",shake:0,rng:Pn(e.seed??7),snap:!0,time:0},n=new D,s=new D,r={onCut:null},o=()=>!!e.reducedMotion?.();function a(x){let p=typeof x=="number"?x:Di.findIndex(m=>m.id===x);return p<0||p>=Di.length||p===t.i?!1:(t.i=p,t.snap=!0,t.shot=null,t.shotT=0,t.last="",!0)}let l=(x=1)=>(t.i=(t.i+x+Di.length)%Di.length,t.snap=!0,t.shot=null,t.shotT=0,t.last="",t.i);function c(x,p){t.az=Kd(t.az-x*.0062),t.el=ct(t.el+p*.005,-.4,1.25),t.idle=0}function u(x){t.dist=ct(t.dist*x,.5,2.6),t.idle=0}function h(x){t.shake=Math.min(1,t.shake+x)}function f(){t.az=0,t.el=0,t.dist=1,t.snap=!0,t.shot=null}function d(x){let p=Gr[Math.floor(t.rng()*Gr.length)];p===t.last&&(p=Gr[(Gr.indexOf(p)+1+Math.floor(t.rng()*(Gr.length-1)))%Gr.length]),t.last=p;let m={type:p,t:0,max:9,fixed:null,u:0,s:0};if(p==="tripod"){let y=t.rng(),_=y<.4?0:y<.72?1:2;m.u=_===0?Be.half+Be.curbW+Be.walkOut-1:_===1?-(Be.half+1):1.1,m.s=x.s+26+t.rng()*16;let v=x.placeAt(m.s,m.u);m.fixed=new D(v.x,v.y+(_===2?1.15:1.55),v.z)}else m.max=4.2+t.rng()*2.6;t.shot=m,t.snap=!0,r.onCut&&r.onCut()}function g(x,p){t.idle+=x,t.time+=x;let m=Di[t.i].id,y=p.hero,_=p.yaw,v=p.speed||0;ri.set(Math.sin(_),0,Math.cos(_)),er.set(-Math.cos(_),0,Math.sin(_));let w=36,S=8,E=10;if(m!=="pov"&&m!=="director"&&t.idle>5&&(t.az=pn(t.az,0,.9,x),t.el=pn(t.el,0,.9,x)),m==="follow"){let A=8.6*t.dist,b=.2+t.el,M=_+Math.PI+t.az;n.set(y.x+Math.sin(M)*Math.cos(b)*A,y.y+Math.sin(b)*A+.5,y.z+Math.cos(M)*Math.cos(b)*A),s.copy(y).addScaledVector(ri,1.6+v*.14),s.y+=1,w=36+v*.25}else if(m==="side")n.copy(y).addScaledVector(er,7.2*t.dist).addScaledVector(ri,t.az*5),n.y+=2+t.el*5,s.copy(y),s.y+=1.15,w=34,S=6,E=8;else if(m==="close"){let A=3.4*t.dist,b=.1+t.el,M=_+.72+t.az;n.set(y.x+Math.sin(M)*Math.cos(b)*A,y.y+Math.sin(b)*A+1.5,y.z+Math.cos(M)*Math.cos(b)*A),s.copy(y).addScaledVector(ri,.35),s.y+=1.8,w=32,S=9}else if(m==="orbit"){let A=5.4*t.dist,b=.2+t.el,M=t.time*.22+t.az+_;n.set(y.x+Math.sin(M)*Math.cos(b)*A,y.y+Math.sin(b)*A+.5,y.z+Math.cos(M)*Math.cos(b)*A),s.copy(y),s.y+=1.15,w=36,S=12}else if(m==="pov")n.set(-.13,.035,.06).applyQuaternion(p.headQuat).add(p.headPos),s.set(0,-.03,1).applyQuaternion(p.headQuat).multiplyScalar(10).add(n),w=62,S=60,E=60;else{t.shot||d(p);let A=t.shot;A.t+=x;let b=A.t>A.max;switch(A.type){case"tripod":n.copy(A.fixed),s.copy(y).addScaledVector(ri,.4),s.y+=1.15,b=b||Qh.copy(y).sub(A.fixed).dot(ri)>11,w=30+ct(v*1.2,0,14),S=9,E=7;break;case"lowFront":n.copy(y).addScaledVector(ri,4.6).addScaledVector(er,-.4),n.y+=.55,s.copy(y),s.y+=1.2,w=34,S=7;break;case"rearWide":n.copy(y).addScaledVector(ri,-9.5).addScaledVector(er,-2.2),n.y+=3.4,s.copy(y),s.y+=1.2,w=38,S=4;break;case"seaLong":n.copy(y).addScaledVector(er,19).addScaledVector(ri,2),n.y+=2.2,s.copy(y),s.y+=1.3,w=15,S=5,E=9;break;case"topDown":n.copy(y).addScaledVector(ri,.6),n.y+=11,s.copy(y),s.y+=.6,w=40,S=6;break;case"wheel":n.copy(y).addScaledVector(er,1.7).addScaledVector(ri,-.05),n.y+=.5,s.copy(y).addScaledVector(ri,-.1),s.y+=.45,w=34,S=12;break;default:n.copy(y).addScaledVector(ri,3.4).addScaledVector(er,-2.2),n.y+=1.5,s.copy(y),s.y+=1.5,w=36,S=7;break}if(b)return d(p),g(0,p)}if(t.snap?(t.pos.copy(n),t.tgt.copy(s),t.fov=w,t.snap=!1):(t.pos.x=pn(t.pos.x,n.x,S,x),t.pos.y=pn(t.pos.y,n.y,S,x),t.pos.z=pn(t.pos.z,n.z,S,x),t.tgt.x=pn(t.tgt.x,s.x,E,x),t.tgt.y=pn(t.tgt.y,s.y,E,x),t.tgt.z=pn(t.tgt.z,s.z,E,x),t.fov=pn(t.fov,w,6,x)),p.offset&&(Qh.copy(s).sub(n).normalize(),U0.crossVectors(Qh,Gt.DEFAULT_UP).normalize(),s.addScaledVector(U0,-p.offset),t.snap||t.tgt.copy(s)),t.shake=Math.max(0,t.shake-x*3.2),i.position.copy(t.pos),t.shake>.001&&!o()){let A=t.shake*t.shake*.09,b=t.time*38;i.position.x+=Math.sin(b*1.3)*A,i.position.y+=Math.cos(b*1.7)*A*.7}i.lookAt(t.tgt),i.fov=t.fov,i.updateProjectionMatrix(),e.onFov&&e.onFov()}return{update:g,setMode:a,cycle:l,orbit:c,zoom:u,shakeBy:h,reset:f,hooks:r,st:t,get mode(){return Di[t.i]},get index(){return t.i}}}var B0=new Set(["up","down"]),k0={ArrowUp:"up",KeyW:"up",ArrowDown:"down",KeyS:"down",Space:"jump",KeyB:"bell",KeyG:"gear",KeyC:"cam",KeyT:"time",KeyY:"cycle",KeyV:"style",KeyN:"music",KeyM:"mute",KeyP:"pause",KeyH:"photo",KeyX:"inspect",KeyR:"reset",KeyK:"squawk",Slash:"help",Escape:"escape",Enter:"enter",KeyF:"fish",Digit1:"cam0",Digit2:"cam1",Digit3:"cam2",Digit4:"cam3",Digit5:"cam4",Digit6:"cam5"};function H0(i,e){let t=new Set,n=new Map,s=null,r=!1,o=0,a=0,l=y=>{let _=y.target;return _&&(_.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(_.tagName))};function c(y){let _=k0[y.code];if(!_||l(y)&&(y.target.tagName==="INPUT"&&B0.has(_)||y.target.tagName==="INPUT"&&(_==="jump"||_==="time"||_==="cycle"))||y.metaKey||y.ctrlKey||y.altKey)return;let v=y.target;if(!((_==="jump"||_==="enter")&&v&&v.closest&&v.closest('button, a[href], summary, [role="button"], [role="switch"], [role="checkbox"]'))&&!(_==="help"&&!y.shiftKey)){if(y.preventDefault(),B0.has(_)){t.add(_);return}y.repeat||e.onAction&&e.onAction(_,y)}}let u=y=>{let _=k0[y.code];_&&t.delete(_)},h=()=>t.clear();function f(y){let _=i.getBoundingClientRect();return[(y.clientX-_.left)/_.width*2-1,-((y.clientY-_.top)/_.height)*2+1]}function d(y){if(document.activeElement&&document.activeElement!==i&&document.activeElement.blur&&document.activeElement.blur(),n.set(y.pointerId,{x:y.clientX,y:y.clientY}),i.setPointerCapture?.(y.pointerId),n.size===1)s={x:y.clientX,y:y.clientY,t:performance.now(),id:y.pointerId},r=!1;else{s=null,r=!0;let[_,v]=[...n.values()];o=Math.hypot(_.x-v.x,_.y-v.y)}}function g(y){let _=n.get(y.pointerId);if(!_)return;let v=y.clientX-_.x,w=y.clientY-_.y;if(_.x=y.clientX,_.y=y.clientY,n.size===1)s&&Math.hypot(y.clientX-s.x,y.clientY-s.y)>5&&(r=!0),r&&e.onOrbit&&e.onOrbit(v,w);else if(n.size===2){let[S,E]=[...n.values()],A=Math.hypot(S.x-E.x,S.y-E.y);o>0&&e.onZoom&&e.onZoom(Math.pow(1.01,A-o)),o=A}}function x(y){if(n.delete(y.pointerId),s&&s.id===y.pointerId&&!r&&performance.now()-s.t<450){let _=performance.now();_-a>180&&(a=_,e.onPick&&e.onPick(...f(y)))}n.size===0&&(s=null,r=!1,o=0)}function p(y){y.preventDefault(),e.onZoom&&e.onZoom(Math.pow(1.0016,y.deltaY))}let m=y=>y.preventDefault();return window.addEventListener("keydown",c),window.addEventListener("keyup",u),window.addEventListener("blur",h),i.addEventListener("pointerdown",d),i.addEventListener("pointermove",g),i.addEventListener("pointerup",x),i.addEventListener("pointercancel",x),i.addEventListener("wheel",p,{passive:!1}),i.addEventListener("contextmenu",m),{held:y=>t.has(y),setHeld:(y,_)=>{_?t.add(y):t.delete(y)},dispose(){window.removeEventListener("keydown",c),window.removeEventListener("keyup",u),window.removeEventListener("blur",h),i.removeEventListener("pointerdown",d),i.removeEventListener("pointermove",g),i.removeEventListener("pointerup",x),i.removeEventListener("pointercancel",x),i.removeEventListener("wheel",p),i.removeEventListener("contextmenu",m)}}}var Si=Object.freeze([60,62,64,67,69,72,74,76,79,81]),uM=Object.freeze([{name:"Am",root:45,tones:[57,60,64]},{name:"F",root:41,tones:[53,57,60]},{name:"C",root:48,tones:[55,60,64]},{name:"G",root:43,tones:[55,59,62]}]),ef=8,Li=Object.freeze({LEAD:0,BASS:1,PAD:2,SHAKER:3}),hM=i=>uM[(i%4+4)%4],z0=i=>(i%12+12)%12,tf=(i,e)=>i.tones.some(t=>z0(t)===z0(e));function fM(i,e){for(let t=1;t<Si.length;t++){let n=e+t,s=e-t;if(n<Si.length&&tf(i,Si[n]))return n;if(s>=0&&tf(i,Si[s]))return s}return e}function G0(i,e){return i>=.05?ct(84+Math.max(0,e||0)*.9,84,150):70}function W0(i={}){let e=i.min??70,t=i.max??150,n=i.tau??1.6,s={bpm:ct(i.init??84,e,t),target:84};return s.set=r=>(s.target=ct(r,e,t),s.target),s.update=r=>(s.bpm+=(s.target-s.bpm)*(1-Math.exp(-Math.max(0,r)/n)),s.bpm=ct(s.bpm,e,t),s.bpm),s}function X0(i=1){let e=Pn(i>>>0),t=new Float64Array(120),n={degree:4,held:0};return n.fill=(s,r,o,a,l=t)=>{let c=0,u=(d,g,x,p,m)=>{let y=c*5;l[y]=d,l[y+1]=g,l[y+2]=x,l[y+3]=p,l[y+4]=m,c++},h=s%ef,f=hM(s/ef|0);if(u(Li.SHAKER,r,o*.5,0,(h%2?.45:.8)*(a?.35:1)),h===0&&u(Li.BASS,r,o*3,f.root,.9),h===4&&u(Li.BASS,r,o*1.8,e()<.5?f.root:f.root+7,.7),h===6&&!a&&e()<.3&&u(Li.BASS,r,o*.9,f.root+12,.5),h===0)for(let d=0;d<3;d++)u(Li.PAD,r,o*ef,f.tones[d],.6);if(n.held>0)n.held--;else{let d=a?.6:h%2===1?.45:.3;if(e()>=d){let g=e(),x=n.degree;g<.42?x+=e()<.5?-1:1:g<.62?x+=e()<.5?-2:2:g<.7&&(x+=e()<.5?-4:4),n.degree=ct(x,0,Si.length-1);let p=Si[n.degree];h===0&&!tf(f,p)&&(p=Si[fM(f,n.degree)]);let m=!a&&e()<.22;u(Li.LEAD,r,o*(m?2:1),p,h===0?.95:.6+e()*.3),m&&(n.held=1)}}return c},n}var V0=i=>30/ct(i,20,400);function q0(i={}){let e=i.lookahead??.12,t={step:0,next:NaN,bpm:i.bpm??84,lookahead:e};return t.reset=n=>{t.step=0,t.next=n+(i.startDelay??.06)},t.tick=(n,s)=>{Number.isFinite(t.next)||t.reset(n);let r=0;for(;t.next<n&&r++<1e5;)t.next+=V0(t.bpm),t.step++;let o=0,a=n+e;for(;t.next<a&&o<256;){let l=V0(t.bpm);s(t.step,t.next,l),t.next+=l,t.step++,o++}return o},t}var Y0=(i,e)=>Math.max(2,Math.round(e/i)),Z0=(i,e)=>i/(e/Y0(i,e));function dM(i,e,t){let n=Math.max(.2,Math.cos(Math.PI*i/e)),s=Math.pow(.001,1/Math.max(.05,t));return Math.min(.99995,Math.pow(s,1/i)/n)}function K0(i,e,t,n={}){let s=n.t60??2.2,r=n.brightness??.5,o=n.seed??1,a=Math.max(64,Math.round(t*e)),l=new Float32Array(a),c=Y0(i,e),u=Pn(o>>>0),h=new Float32Array(c),f=.12+.88*Math.max(0,Math.min(1,r)),d=0,g=0;for(let _=0;_<c;_++)d+=f*(u()*2-1-d),h[_]=d,g+=d;g/=c;for(let _=0;_<c;_++)h[_]-=g;let x=dM(i,e,s);for(let _=0,v=0;_<a;_++){let w=h[v],S=v+1===c?h[0]:h[v+1];l[_]=w,h[v]=x*.5*(w+S),v=v+1===c?0:v+1}let p=Math.min(a,Math.round(.03*e));for(let _=0;_<p;_++)l[a-1-_]*=_/p;let m=1e-9;for(let _=0;_<a;_++){let v=Math.abs(l[_]);v>m&&(m=v)}let y=Math.min(8,.9/m);for(let _=0;_<a;_++)l[_]*=y;return l}function Oc(i,e,t={}){let n=t.color??"white",s=t.seed??1,r=Math.max(256,Math.round(i*e)),o=new Float32Array(r),a=Pn(s>>>0);if(n==="pink"){let h=0,f=0,d=0,g=0,x=0,p=0,m=0;for(let y=0;y<r;y++){let _=a()*2-1;h=.99886*h+_*.0555179,f=.99332*f+_*.0750759,d=.969*d+_*.153852,g=.8665*g+_*.3104856,x=.55*x+_*.5329522,p=-.7616*p-_*.016898,o[y]=(h+f+d+g+x+p+m+_*.5362)*.11,m=_*.115926}}else if(n==="brown"){let h=0;for(let f=0;f<r;f++)h=(h+.02*(a()*2-1))/1.02,o[f]=h*3.5}else for(let h=0;h<r;h++)o[h]=a()*2-1;let l=Math.min(r>>2,Math.round(.02*e));for(let h=0;h<l;h++){let f=h/l;o[h]=o[h]*f+o[r-l+h]*(1-f)}let c=1e-9;for(let h=0;h<r-l;h++){let f=Math.abs(o[h]);f>c&&(c=f)}let u=Math.min(1,.9/c);for(let h=0;h<r-l;h++)o[h]*=u;return o.subarray(0,r-l)}function $0(i=6,e=1024){let t=new Float32Array(e);for(let n=0;n<e;n++){let s=n/(e-1)*2-1;t[n]=Math.tanh(s*i)/Math.tanh(i)}return t}var Hc=i=>440*Math.pow(2,(i-69)/12),Bc=(i,e)=>i+Math.random()*(e-i),Pt=(i,e)=>{let t=i.createGain();return t.gain.value=e,t};function cn(i,e,t,n,s){let r=i.createGain(),o=r.gain,a=Math.max(5e-4,n),l=Math.max(.01,s);return o.setValueAtTime(1e-4,e),o.exponentialRampToValueAtTime(Math.max(2e-4,t),e+a),o.exponentialRampToValueAtTime(1e-4,e+a+l),o.setValueAtTime(0,e+a+l+.01),r}function Dn(i,e,t,n,s,r,o=0){let a=i.createOscillator();return a.type=e,a.frequency.setValueAtTime(t,n),o&&a.detune.setValueAtTime(o,n),a.connect(r),a.start(n),a.stop(Math.max(n,s)),a}function mi(i,e,t,n,s){let r=i.createBufferSource();return r.buffer=e,r.loop=!0,r.connect(s),r.start(t,Math.random()*Math.max(.01,e.duration-.05)),r.stop(Math.max(t,n)),r}function Bt(i,e,t,n=1){let s=i.createBiquadFilter();return s.type=e,s.frequency.value=t,s.Q.value=n,s}function kc(i,e,t,n){let s=Pt(i,1);if(s.connect(e),t){let r=Pt(i,n);s.connect(r),r.connect(t)}return s}function J0(i,e){if(!i.createStereoPanner)return Pt(i,1);let t=i.createStereoPanner();return t.pan.value=Math.max(-1,Math.min(1,e)),t}function j0(i,e){let t=Pt(i,1),n=i.createDelay(1);n.delayTime.value=.27;let s=Bt(i,"lowpass",2400,.5),r=Pt(i,.3);t.connect(n),n.connect(s),s.connect(r),r.connect(n);let o=Pt(i,.45);return s.connect(o),o.connect(e),{input:t}}var ra={bell(i,e,t,n,s){let r=[1,.5,.75,2.74,.3,.42,5.43,.16,.25];for(let o=0;o<2;o++){let a=s+o*.11,l=o?.8:1,c=kc(i,e,t,.35);for(let f=0;f<9;f+=3){let d=cn(i,a,r[f+1]*l,.002,r[f+2]);d.connect(c),Dn(i,"sine",2150*r[f]*(1+(Math.random()-.5)*.004),a,a+r[f+2]+.05,d)}let u=Bt(i,"bandpass",5200,2),h=cn(i,a,.12*l,.001,.012);u.connect(h),h.connect(e),mi(i,n.white,a,a+.03,u)}},squawk(i,e,t,n,s){let r=i.createWaveShaper();r.curve=$0(6),r.oversample="2x";let o=Bt(i,"bandpass",1700,2.6),a=Pt(i,0);a.gain.setValueAtTime(0,s);let l=kc(i,e,t,.25);l.gain.value=.5,r.connect(o),o.connect(a),a.connect(l);let c=i.createOscillator();c.frequency.value=38;let u=Pt(i,26);c.connect(u),c.start(s),c.stop(s+.5);for(let h=0;h<2;h++){let f=s+h*.21,d=h?.24:.17,g=h?330:430,x=h?190:250;a.gain.linearRampToValueAtTime(1,f+.025),a.gain.setValueAtTime(1,f+d*.6),a.gain.linearRampToValueAtTime(0,f+d),o.frequency.setValueAtTime(1700,f),o.frequency.exponentialRampToValueAtTime(750,f+d);let p=Dn(i,"sawtooth",g,f,f+d+.02,r);p.frequency.exponentialRampToValueAtTime(x,f+d),u.connect(p.frequency);let m=Pt(i,.45);m.connect(r),mi(i,n.white,f,f+d+.02,m)}},jump(i,e,t,n,s){let r=Bt(i,"bandpass",600,1.4),o=cn(i,s,.2,.07,.22);r.frequency.setValueAtTime(600,s),r.frequency.exponentialRampToValueAtTime(1900,s+.28),r.connect(o),o.connect(e),mi(i,n.white,s,s+.32,r)},land(i,e,t,n,s,r){let o=Math.max(0,Math.min(1.3,r??1));if(o<=.001)return;let a=cn(i,s,.7*o,.004,.18);a.connect(e),Dn(i,"sine",105,s,s+.22,a).frequency.exponentialRampToValueAtTime(48,s+.16);let c=Bt(i,"lowpass",900,.7),u=cn(i,s,.35*o,.002,.09);c.connect(u),u.connect(e),mi(i,n.brown,s,s+.12,c);let h=2+Math.round(3*Math.min(1,o));for(let f=0;f<h;f++){let d=s+.01+f*Bc(.022,.05),g=Bt(i,"bandpass",Bc(2800,5400),6),x=cn(i,d,.12*o,.001,.03);g.connect(x),x.connect(e),mi(i,n.white,d,d+.05,g)}},splash(i,e,t,n,s,r){let o=Math.max(0,Math.min(1.5,r??1));if(o<=.001)return;let a=Bt(i,"lowpass",6500,.7),l=cn(i,s,.55*o,.004,.4);a.frequency.setValueAtTime(6500,s),a.frequency.exponentialRampToValueAtTime(450,s+.38),a.connect(l),l.connect(e),mi(i,n.white,s,s+.45,a);let c=Bt(i,"lowpass",500,.7),u=cn(i,s,.3*o,.003,.2);c.connect(u),u.connect(e),mi(i,n.brown,s,s+.25,c);for(let h=0;h<3;h++){let f=s+.12+h*Bc(.09,.19),d=Bc(900,1500),g=cn(i,f,.07*o,.003,.07),x=kc(i,e,t,.5);g.connect(x),Dn(i,"sine",d,f,f+.09,g).frequency.exponentialRampToValueAtTime(d*1.5,f+.06)}},gulp(i,e,t,n,s){for(let a=0;a<2;a++){let l=s+a*.13,c=a?300:430,u=a?110:140,h=cn(i,l,a?.3:.5,.006,.16),f=Bt(i,"lowpass",1200,.7);f.connect(h),h.connect(e),Dn(i,"sine",c,l,l+.2,f).frequency.exponentialRampToValueAtTime(u,l+(a?.1:.13))}let r=Bt(i,"bandpass",1800,3),o=cn(i,s,.1,.001,.015);r.connect(o),o.connect(e),mi(i,n.white,s,s+.03,r)},click(i,e,t,n,s){let r=Bt(i,"bandpass",3400,5),o=cn(i,s,.25,.001,.018);r.connect(o),o.connect(e),mi(i,n.white,s,s+.04,r);let a=cn(i,s,.08,.001,.012);a.connect(e),Dn(i,"sine",1900,s,s+.03,a)},toggle(i,e,t,n,s){ra.click(i,e,t,n,s),[[1320,0],[1760,.045]].forEach(([r,o])=>{let a=cn(i,s+o,.11,.003,o?.06:.04);a.connect(e),Dn(i,"sine",r,s+o,s+o+.09,a)})},shift(i,e,t,n,s){let r=Bt(i,"bandpass",1300,2.2),o=cn(i,s,.3,.002,.035);r.connect(o),o.connect(e),mi(i,n.white,s,s+.06,r);let a=cn(i,s,.25,.003,.07);a.connect(e),Dn(i,"sine",170,s,s+.1,a).frequency.exponentialRampToValueAtTime(120,s+.06)},gull(i,e,t,n,s,r){let o=J0(i,r);o.connect(e);let a=Pt(i,.8);o.connect(a),a.connect(t);let l=Pt(i,.085);l.connect(o);let c=2+(Math.random()<.45?1:0),u=1300+Math.random()*300;for(let h=0;h<c;h++){let f=s+h*.27,d=u*Math.pow(.94,h),g=Pt(i,0);g.gain.setValueAtTime(0,f),g.gain.linearRampToValueAtTime(1,f+.035),g.gain.setValueAtTime(1,f+.12),g.gain.linearRampToValueAtTime(0,f+.25),g.connect(l);let x=Bt(i,"bandpass",1900,1.4);x.connect(g);let p=Dn(i,"triangle",d,f,f+.27,x);p.frequency.setValueAtTime(d,f),p.frequency.linearRampToValueAtTime(d*1.14,f+.07),p.frequency.exponentialRampToValueAtTime(d*.7,f+.24);let m=Pt(i,.3);m.connect(g),Dn(i,"sine",d*2.01,f,f+.27,m)}},buoy(i,e,t,n,s){let r=kc(i,e,t,.6),o=Bt(i,"lowpass",1300,.5);o.connect(r);let a=[1,.5,1.3,1.59,.25,.85,2.14,.12,.5,2.71,.06,.3];for(let u=0;u<12;u+=3){let h=cn(i,s,a[u+1]*.22,.004,a[u+2]);h.connect(o),Dn(i,"sine",196*a[u],s,s+a[u+2]+.05,h)}let l=Bt(i,"bandpass",900,3),c=cn(i,s,.06,.001,.03);l.connect(c),c.connect(r),mi(i,n.white,s,s+.05,l)}};function Q0(i,e,t,n,s,r,o,a){let l=i.createBufferSource();l.buffer=n.buffer,l.playbackRate.value=n.rate*(1+(Math.random()-.5)*.004);let c=Pt(i,.5*o),u=J0(i,a),h=Math.min(n.buffer.duration,Math.max(.3,r+1.1));l.connect(c),c.connect(u),u.connect(e);let f=Pt(i,.35);u.connect(f),f.connect(t),c.gain.setValueAtTime(.5*o,s+Math.max(.01,h-.08)),c.gain.linearRampToValueAtTime(0,s+h),l.start(s),l.stop(s+h)}function em(i,e,t,n,s,r){let o=Hc(s),a=.2*r,l=Pt(i,0);l.gain.setValueAtTime(0,t),l.gain.linearRampToValueAtTime(a,t+.015),l.gain.setValueAtTime(a,t+n),l.gain.linearRampToValueAtTime(0,t+n+.1);let c=Bt(i,"lowpass",420,.7);c.connect(l),l.connect(e),Dn(i,"triangle",o,t,t+n+.12,c);let u=Pt(i,.6);u.connect(c),Dn(i,"sine",o,t,t+n+.12,u)}function tm(i,e,t,n,s,r,o){let a=Hc(r),l=.035*o,c=Pt(i,0);c.gain.setValueAtTime(0,n),c.gain.linearRampToValueAtTime(l,n+.4),c.gain.setValueAtTime(l,n+s-.1),c.gain.linearRampToValueAtTime(0,n+s+.5);let u=Bt(i,"lowpass",900,.4);u.connect(c),c.connect(e);let h=Pt(i,.5);c.connect(h),h.connect(t),Dn(i,"triangle",a,n,n+s+.55,u,6),Dn(i,"triangle",a,n,n+s+.55,u,-6)}function nm(i,e,t,n,s){let r=Bt(i,"highpass",6500,.7),o=cn(i,n,.05*s,.002,.045);r.connect(o),o.connect(e),mi(i,t.white,n,n+.08,r)}function im(i,e,t,n){let s={},r=(g,x)=>{let p=i.createBufferSource();return p.buffer=g,p.loop=!0,p.connect(x),p.start(),p},o=(g,x,p)=>{let m=i.createOscillator();m.frequency.value=g;let y=Pt(i,x);m.connect(y),y.connect(p),m.start()};s.rumbleFlt=Bt(i,"lowpass",120,.6),s.rumbleGain=Pt(i,0),r(n.brown,s.rumbleFlt),s.rumbleFlt.connect(s.rumbleGain),s.rumbleGain.connect(e),s.windFlt=Bt(i,"bandpass",700,.7),s.windGain=Pt(i,0),r(n.white,s.windFlt),s.windFlt.connect(s.windGain),s.windGain.connect(e);let a=Bt(i,"lowpass",520,.3);s.seaGain=Pt(i,0),r(n.pink,a),a.connect(s.seaGain),s.seaGain.connect(t),o(.085,.03,s.seaGain.gain),o(.061,.02,s.seaGain.gain),o(.043,160,a.frequency),s.tickOsc=i.createOscillator(),s.tickOsc.type="square",s.tickOsc.frequency.value=20;let l=Bt(i,"highpass",3800,.7),c=Bt(i,"bandpass",5200,2.5);s.tickGain=Pt(i,0),s.tickOsc.connect(l),l.connect(c),c.connect(s.tickGain),s.tickGain.connect(e),s.tickOsc.start();let u=Bt(i,"bandpass",2400,1.4);s.chainGain=Pt(i,0),r(n.white,u),u.connect(s.chainGain),s.chainGain.connect(e);let h=Bt(i,"bandpass",560,.9),f=Pt(i,1);s.breathGain=Pt(i,0),r(n.white,h),h.connect(f),f.connect(s.breathGain),s.breathGain.connect(e),s.breathLfo=i.createOscillator(),s.breathLfo.frequency.value=.8;let d=Pt(i,.8);return s.breathLfo.connect(d),d.connect(f.gain),s.breathLfo.start(),s}var mM=Object.freeze({}),gM=Object.freeze({}),xM=60/(Math.PI*2),vM=25,yM=.12;function sm(){let i=typeof globalThis<"u"?globalThis.AudioContext||globalThis.webkitAudioContext:null,e={ctx:null,master:null,sfx:null,ride:null,amb:null,music:null,send:null,noise:null,beds:null,lead:null,timer:0},t={muted:!1,volume:.8,musicOn:!1,sparse:!0,paramT:1,gullIn:5,buoyIn:3,hour:13},n=W0(),s=X0(11),r=q0({lookahead:yM}),o=new Float64Array(120),a=!1,l=()=>!!e.ctx&&e.ctx.state==="running";function c(v){e.ctx=v;let w=v.createDynamicsCompressor();w.threshold.value=-16,w.knee.value=18,w.ratio.value=4,w.attack.value=.004,w.release.value=.22,w.connect(v.destination),e.master=v.createGain(),e.master.gain.value=0,e.master.connect(w);let S=A=>{let b=v.createGain();return b.gain.value=A,b.connect(e.master),b};e.sfx=S(.9),e.ride=S(.8),e.amb=S(.7),e.music=S(0),e.send=j0(v,e.master).input,e.noise={white:u(v,Oc(3,v.sampleRate,{color:"white",seed:3})),pink:u(v,Oc(4,v.sampleRate,{color:"pink",seed:5})),brown:u(v,Oc(4,v.sampleRate,{color:"brown",seed:7}))},e.beds=im(v,e.ride,e.amb,e.noise);let E=v.sampleRate;e.lead=Si.map((A,b)=>{let M=Hc(A);return[0,1].map(R=>{let L=K0(M,E,2,{t60:R?1.8:2.4,brightness:R?.32:.5,seed:100+b*2+R});return{buffer:u(v,L),rate:Z0(M,E)}})})}let u=(v,w)=>{let S=v.createBuffer(1,w.length,v.sampleRate);return S.copyToChannel(w,0),S};function h(){e.ctx&&e.master.gain.setTargetAtTime(t.muted?0:t.volume*.9,e.ctx.currentTime,.025)}let f=(v,w,S)=>{let E=e.ctx,A=s.fill(v,w,S,t.sparse,o);for(let b=0;b<A;b++){let M=b*5,R=o[M],L=o[M+1],U=o[M+2],V=o[M+3],X=o[M+4];if(R===Li.LEAD){let $=0;for(;$<Si.length-1&&Si[$]!==V;)$++;a=!a,Q0(E,e.music,e.send,e.lead[$][a?1:0],L,U,X,a?.25:-.25)}else R===Li.BASS?em(E,e.music,L,U,V,X):R===Li.PAD?tm(E,e.music,e.send,L,U,V,X):nm(E,e.music,e.noise,L,X)}},d=()=>{};function g(){let v=e.ctx;!v||v.state!=="running"||(r.bpm=n.bpm,r.tick(v.currentTime,t.muted?d:f))}function x(){e.timer||!e.ctx||(r.reset(e.ctx.currentTime),e.music.gain.setTargetAtTime(.85,e.ctx.currentTime,.25),e.timer=setInterval(g,vM),g())}function p(){e.timer&&(clearInterval(e.timer),e.timer=0),e.ctx&&e.music.gain.setTargetAtTime(0,e.ctx.currentTime,.15)}function m(v,w,S){let E=v||mM,A=S||gM,b=E.v||0,M=Number.isFinite(w)?Math.max(0,w):0,R=Number.isFinite(A.cadence)?A.cadence:Math.abs(E.crankVel||0)*xM;t.sparse=!(b>=.05),n.set(G0(b,R)),n.update(M);let L=Number.isFinite(A.hour)?A.hour:t.hour;if(t.hour=L,!e.ctx||e.ctx.state!=="running"||t.muted)return;let U=L>20||L<5;if(t.paramT+=M,t.paramT>=1/30){t.paramT=0;let V=e.ctx.currentTime,X=e.beds,$=wt(b/12.5),K=.06,O=wt($*$*.9+wt(A.wind||0)*.5);X.rumbleGain.gain.setTargetAtTime(.5*$*$,V,K),X.rumbleFlt.frequency.setTargetAtTime(110+190*$,V,K),X.windGain.gain.setTargetAtTime(.34*O,V,K),X.windFlt.frequency.setTargetAtTime(520+900*O,V,K);let j=E.mode==="coast"&&b>.1;X.tickOsc.frequency.setTargetAtTime(Math.max(.5,ct(b*9,0,95)*.5),V,.02),X.tickGain.gain.setTargetAtTime(j?ct(.05+b*.012,0,.14):0,V,.03);let J=E.mode==="pedal"?wt(E.pedalPower||0)*(E.air?0:1):0;X.chainGain.gain.setTargetAtTime(.07*J,V,K),X.breathGain.gain.setTargetAtTime(.05*J,V,.2),X.breathLfo.frequency.setTargetAtTime(Math.max(.05,R/60*.5),V,.2),X.seaGain.gain.setTargetAtTime(U?.035:.055,V,.5)}t.gullIn-=M,t.buoyIn-=M,t.gullIn<=0&&(t.gullIn=9+Math.random()*14,L>21.5||L<5.5||ra.gull(e.ctx,e.amb,e.send,e.noise,e.ctx.currentTime+.02,Math.random()*1.6-.8)),U&&t.buoyIn<=0?(t.buoyIn=5+Math.random()*4,ra.buoy(e.ctx,e.amb,e.send,e.noise,e.ctx.currentTime+.02)):!U&&t.buoyIn<2&&(t.buoyIn=2+Math.random()*3)}function y(v,w){if(!l()||t.muted)return!1;try{return ra[v](e.ctx,e.sfx,e.send,e.noise,e.ctx.currentTime+.003,w),!0}catch{return!1}}return{get ready(){return l()},get muted(){return t.muted},unlock(){try{if(!e.ctx){if(!i)return!1;c(new i({latencyHint:"interactive"}))}return(e.ctx.state==="suspended"||e.ctx.state==="interrupted")&&e.ctx.resume().catch(()=>{}),h(),t.musicOn&&x(),l()}catch{if(p(),e.ctx)try{e.ctx.close()}catch{}return e.ctx=null,!1}},setMuted(v){t.muted=!!v,h()},setVolume(v){t.volume=wt(Number.isFinite(v)?v:0),h()},setMusicEnabled(v){let w=!!v;t.musicOn!==w&&(t.musicOn=w,e.ctx&&(w?x():p()))},sfx:{bell:()=>y("bell"),squawk:()=>y("squawk"),jump:()=>y("jump"),land:v=>y("land",v),splash:v=>y("splash",v),gulp:()=>y("gulp"),click:()=>y("click"),toggle:()=>y("toggle"),shift:()=>y("shift")},update:m,getState(){let v=e.ctx?e.ctx.state:"none";return{ctx:v==="running"?"running":v==="none"||v==="closed"?"none":"suspended",bpm:n.bpm,muted:t.muted,music:t.musicOn,volume:t.volume}},dispose(){if(p(),e.ctx)try{e.ctx.close()}catch{}e.ctx=e.master=e.sfx=e.ride=e.amb=e.music=e.send=e.noise=e.beds=e.lead=null}}}var _M={"arrow-bend-double-up-left":'<path d="M85.66,146.34a8,8,0,0,1-11.32,11.32l-48-48a8,8,0,0,1,0-11.32l48-48A8,8,0,0,1,85.66,61.66L43.31,104ZM128,96H99.31l34.35-34.34a8,8,0,0,0-11.32-11.32l-48,48a8,8,0,0,0,0,11.32l48,48a8,8,0,0,0,11.32-11.32L99.31,112H128a88.1,88.1,0,0,1,88,88,8,8,0,0,0,16,0A104.11,104.11,0,0,0,128,96Z"/>',"arrow-clockwise":'<path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z"/>',"arrow-down":'<path d="M205.66,149.66l-72,72a8,8,0,0,1-11.32,0l-72-72a8,8,0,0,1,11.32-11.32L120,196.69V40a8,8,0,0,1,16,0V196.69l58.34-58.35a8,8,0,0,1,11.32,11.32Z"/>',"arrow-up":'<path d="M205.66,117.66a8,8,0,0,1-11.32,0L136,59.31V216a8,8,0,0,1-16,0V59.31L61.66,117.66a8,8,0,0,1-11.32-11.32l72-72a8,8,0,0,1,11.32,0l72,72A8,8,0,0,1,205.66,117.66Z"/>',"arrows-vertical":'<path d="M165.66,194.34a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32L120,212.69V43.31L101.66,61.66A8,8,0,0,1,90.34,50.34l32-32a8,8,0,0,1,11.32,0l32,32a8,8,0,0,1-11.32,11.32L136,43.31V212.69l18.34-18.35A8,8,0,0,1,165.66,194.34Z"/>',bell:'<path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"/>',bicycle:'<path d="M208,112a47.81,47.81,0,0,0-16.93,3.09L165.93,72H192a8,8,0,0,1,8,8,8,8,0,0,0,16,0,24,24,0,0,0-24-24H152a8,8,0,0,0-6.91,12l11.65,20H99.26L82.91,60A8,8,0,0,0,76,56H48a8,8,0,0,0,0,16H71.41L85.12,95.51,69.41,117.06a48.13,48.13,0,1,0,12.92,9.44l11.59-15.9L125.09,164A8,8,0,1,0,138.91,156l-30.32-52h57.48l11.19,19.17A48,48,0,1,0,208,112ZM80,160a32,32,0,1,1-20.21-29.74l-18.25,25a8,8,0,1,0,12.92,9.42l18.25-25A31.88,31.88,0,0,1,80,160Zm128,32a32,32,0,0,1-22.51-54.72L201.09,164A8,8,0,1,0,214.91,156L199.3,129.21A32,32,0,1,1,208,192Z"/>',bird:'<path d="M176,68a12,12,0,1,1-12-12A12,12,0,0,1,176,68Zm64,12a8,8,0,0,1-3.56,6.66L216,100.28V120A104.11,104.11,0,0,1,112,224H24a16,16,0,0,1-12.49-26l.1-.12L96,96.63V76.89C96,43.47,122.79,16.16,155.71,16H156a60,60,0,0,1,57.21,41.86l23.23,15.48A8,8,0,0,1,240,80Zm-22.42,0L201.9,69.54a8,8,0,0,1-3.31-4.64A44,44,0,0,0,156,32h-.22C131.64,32.12,112,52.25,112,76.89V99.52a8,8,0,0,1-1.85,5.13L24,208h26.9l70.94-85.12a8,8,0,1,1,12.29,10.24L71.75,208H112a88.1,88.1,0,0,0,88-88V96a8,8,0,0,1,3.56-6.66Z"/>',camera:'<path d="M208,56H180.28L166.65,35.56A8,8,0,0,0,160,32H96a8,8,0,0,0-6.65,3.56L75.71,56H48A24,24,0,0,0,24,80V192a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V80A24,24,0,0,0,208,56Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H80a8,8,0,0,0,6.66-3.56L100.28,48h55.43l13.63,20.44A8,8,0,0,0,176,72h32a8,8,0,0,1,8,8ZM128,88a44,44,0,1,0,44,44A44.05,44.05,0,0,0,128,88Zm0,72a28,28,0,1,1,28-28A28,28,0,0,1,128,160Z"/>',clock:'<path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"/>',"eye-slash":'<path d="M53.92,34.62A8,8,0,1,0,42.08,45.38L61.32,66.55C25,88.84,9.38,123.2,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208a127.11,127.11,0,0,0,52.07-10.83l22,24.21a8,8,0,1,0,11.84-10.76Zm47.33,75.84,41.67,45.85a32,32,0,0,1-41.67-45.85ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.16,133.16,0,0,1,25,128c4.69-8.79,19.66-33.39,47.35-49.38l18,19.75a48,48,0,0,0,63.66,70l14.73,16.2A112,112,0,0,1,128,192Zm6-95.43a8,8,0,0,1,3-15.72,48.16,48.16,0,0,1,38.77,42.64,8,8,0,0,1-7.22,8.71,6.39,6.39,0,0,1-.75,0,8,8,0,0,1-8-7.26A32.09,32.09,0,0,0,134,96.57Zm113.28,34.69c-.42.94-10.55,23.37-33.36,43.8a8,8,0,1,1-10.67-11.92A132.77,132.77,0,0,0,231.05,128a133.15,133.15,0,0,0-23.12-30.77C185.67,75.19,158.78,64,128,64a118.37,118.37,0,0,0-19.36,1.57A8,8,0,1,1,106,49.79,134,134,0,0,1,128,48c34.88,0,66.57,13.26,91.66,38.35,18.83,18.83,27.3,37.62,27.65,38.41A8,8,0,0,1,247.31,131.26Z"/>',fish:'<path d="M168,76a12,12,0,1,1-12-12A12,12,0,0,1,168,76Zm48.72,67.64c-19.37,34.9-55.44,53.76-107.24,56.1l-22,51.41A8,8,0,0,1,80.1,256l-.51,0a8,8,0,0,1-7.19-5.78L57.6,198.39,5.8,183.56a8,8,0,0,1-1-15.05l51.41-22c2.35-51.78,21.21-87.84,56.09-107.22,24.75-13.74,52.74-15.84,71.88-15.18,18.64.64,36,4.27,38.86,6a8,8,0,0,1,2.83,2.83c1.69,2.85,5.33,20.21,6,38.85C232.55,90.89,230.46,118.89,216.72,143.64Zm-55.18,29a52.11,52.11,0,0,1-33.4-44.78A52.09,52.09,0,0,1,83.37,94.47q-10.45,23.79-11.3,57.59a8,8,0,0,1-4.85,7.17L31.83,174.37l34.45,9.86a8,8,0,0,1,5.49,5.5l9.84,34.44,15.16-35.4a8,8,0,0,1,7.17-4.84Q137.71,183.12,161.54,172.64ZM212.42,43.57c-14.15-3-64.1-11-100.3,14.75a81.21,81.21,0,0,0-16,15.07,36,36,0,0,0,39.35,38.44,8,8,0,0,1,8.73,8.73,36,36,0,0,0,38.47,39.34,80.81,80.81,0,0,0,15-16C223.42,107.73,215.42,57.74,212.42,43.57Z"/>',"flag-pennant":'<path d="M242.63,96.44l-184-64A8,8,0,0,0,48,40V216a8,8,0,0,0,16,0V173.69l178.63-62.13a8,8,0,0,0,0-15.12ZM64,156.75V51.25L215.65,104Z"/>',"gear-six":'<path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm109.94-52.79a8,8,0,0,0-3.89-5.4l-29.83-17-.12-33.62a8,8,0,0,0-2.83-6.08,111.91,111.91,0,0,0-36.72-20.67,8,8,0,0,0-6.46.59L128,41.85,97.88,25a8,8,0,0,0-6.47-.6A112.1,112.1,0,0,0,54.73,45.15a8,8,0,0,0-2.83,6.07l-.15,33.65-29.83,17a8,8,0,0,0-3.89,5.4,106.47,106.47,0,0,0,0,41.56,8,8,0,0,0,3.89,5.4l29.83,17,.12,33.62a8,8,0,0,0,2.83,6.08,111.91,111.91,0,0,0,36.72,20.67,8,8,0,0,0,6.46-.59L128,214.15,158.12,231a7.91,7.91,0,0,0,3.9,1,8.09,8.09,0,0,0,2.57-.42,112.1,112.1,0,0,0,36.68-20.73,8,8,0,0,0,2.83-6.07l.15-33.65,29.83-17a8,8,0,0,0,3.89-5.4A106.47,106.47,0,0,0,237.94,107.21Zm-15,34.91-28.57,16.25a8,8,0,0,0-3,3c-.58,1-1.19,2.06-1.81,3.06a7.94,7.94,0,0,0-1.22,4.21l-.15,32.25a95.89,95.89,0,0,1-25.37,14.3L134,199.13a8,8,0,0,0-3.91-1h-.19c-1.21,0-2.43,0-3.64,0a8.08,8.08,0,0,0-4.1,1l-28.84,16.1A96,96,0,0,1,67.88,201l-.11-32.2a8,8,0,0,0-1.22-4.22c-.62-1-1.23-2-1.8-3.06a8.09,8.09,0,0,0-3-3.06l-28.6-16.29a90.49,90.49,0,0,1,0-28.26L61.67,97.63a8,8,0,0,0,3-3c.58-1,1.19-2.06,1.81-3.06a7.94,7.94,0,0,0,1.22-4.21l.15-32.25a95.89,95.89,0,0,1,25.37-14.3L122,56.87a8,8,0,0,0,4.1,1c1.21,0,2.43,0,3.64,0a8.08,8.08,0,0,0,4.1-1l28.84-16.1A96,96,0,0,1,188.12,55l.11,32.2a8,8,0,0,0,1.22,4.22c.62,1,1.23,2,1.8,3.06a8.09,8.09,0,0,0,3,3.06l28.6,16.29A90.49,90.49,0,0,1,222.9,142.12Z"/>',info:'<path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"/>',keyboard:'<path d="M224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48Zm0,144H32V64H224V192Zm-16-64a8,8,0,0,1-8,8H56a8,8,0,0,1,0-16H200A8,8,0,0,1,208,128Zm0-32a8,8,0,0,1-8,8H56a8,8,0,0,1,0-16H200A8,8,0,0,1,208,96ZM72,160a8,8,0,0,1-8,8H56a8,8,0,0,1,0-16h8A8,8,0,0,1,72,160Zm96,0a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,160Zm40,0a8,8,0,0,1-8,8h-8a8,8,0,0,1,0-16h8A8,8,0,0,1,208,160Z"/>',"map-pin":'<path d="M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z"/>',"moon-stars":'<path d="M240,96a8,8,0,0,1-8,8H216v16a8,8,0,0,1-16,0V104H184a8,8,0,0,1,0-16h16V72a8,8,0,0,1,16,0V88h16A8,8,0,0,1,240,96ZM144,56h8v8a8,8,0,0,0,16,0V56h8a8,8,0,0,0,0-16h-8V32a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16Zm72.77,97a8,8,0,0,1,1.43,8A96,96,0,1,1,95.07,37.8a8,8,0,0,1,10.6,9.06A88.07,88.07,0,0,0,209.14,150.33,8,8,0,0,1,216.77,153Zm-19.39,14.88c-1.79.09-3.59.14-5.38.14A104.11,104.11,0,0,1,88,64c0-1.79,0-3.59.14-5.38A80,80,0,1,0,197.38,167.86Z"/>',"music-notes":'<path d="M212.92,17.69a8,8,0,0,0-6.86-1.45l-128,32A8,8,0,0,0,72,56V166.08A36,36,0,1,0,88,196V110.25l112-28v51.83A36,36,0,1,0,216,164V24A8,8,0,0,0,212.92,17.69ZM52,216a20,20,0,1,1,20-20A20,20,0,0,1,52,216ZM88,93.75V62.25l112-28v31.5ZM180,184a20,20,0,1,1,20-20A20,20,0,0,1,180,184Z"/>',pause:'<path d="M200,32H160a16,16,0,0,0-16,16V208a16,16,0,0,0,16,16h40a16,16,0,0,0,16-16V48A16,16,0,0,0,200,32Zm0,176H160V48h40ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Zm0,176H56V48H96Z"/>',play:'<path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z"/>',question:'<path d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"/>',sparkle:'<path d="M197.58,129.06,146,110l-19-51.62a15.92,15.92,0,0,0-29.88,0L78,110l-51.62,19a15.92,15.92,0,0,0,0,29.88L78,178l19,51.62a15.92,15.92,0,0,0,29.88,0L146,178l51.62-19a15.92,15.92,0,0,0,0-29.88ZM137,164.22a8,8,0,0,0-4.74,4.74L112,223.85,91.78,169A8,8,0,0,0,87,164.22L32.15,144,87,123.78A8,8,0,0,0,91.78,119L112,64.15,132.22,119a8,8,0,0,0,4.74,4.74L191.85,144ZM144,40a8,8,0,0,1,8-8h16V16a8,8,0,0,1,16,0V32h16a8,8,0,0,1,0,16H184V64a8,8,0,0,1-16,0V48H152A8,8,0,0,1,144,40ZM248,88a8,8,0,0,1-8,8h-8v8a8,8,0,0,1-16,0V96h-8a8,8,0,0,1,0-16h8V72a8,8,0,0,1,16,0v8h8A8,8,0,0,1,248,88Z"/>',"speaker-high":'<path d="M155.51,24.81a8,8,0,0,0-8.42.88L77.25,80H32A16,16,0,0,0,16,96v64a16,16,0,0,0,16,16H77.25l69.84,54.31A8,8,0,0,0,160,224V32A8,8,0,0,0,155.51,24.81ZM32,96H72v64H32ZM144,207.64,88,164.09V91.91l56-43.55Zm54-106.08a40,40,0,0,1,0,52.88,8,8,0,0,1-12-10.58,24,24,0,0,0,0-31.72,8,8,0,0,1,12-10.58ZM248,128a79.9,79.9,0,0,1-20.37,53.34,8,8,0,0,1-11.92-10.67,64,64,0,0,0,0-85.33,8,8,0,1,1,11.92-10.67A79.83,79.83,0,0,1,248,128Z"/>',"speaker-slash":'<path d="M53.92,34.62A8,8,0,1,0,42.08,45.38L73.55,80H32A16,16,0,0,0,16,96v64a16,16,0,0,0,16,16H77.25l69.84,54.31A8,8,0,0,0,160,224V175.09l42.08,46.29a8,8,0,1,0,11.84-10.76ZM32,96H72v64H32ZM144,207.64,88,164.09V95.89l56,61.6Zm42-63.77a24,24,0,0,0,0-31.72,8,8,0,1,1,12-10.57,40,40,0,0,1,0,52.88,8,8,0,0,1-12-10.59Zm-80.16-76a8,8,0,0,1,1.4-11.23l39.85-31A8,8,0,0,1,160,32v74.83a8,8,0,0,1-16,0V48.36l-26.94,21A8,8,0,0,1,105.84,67.91ZM248,128a79.9,79.9,0,0,1-20.37,53.34,8,8,0,0,1-11.92-10.67,64,64,0,0,0,0-85.33,8,8,0,1,1,11.92-10.67A79.83,79.83,0,0,1,248,128Z"/>',"sun-horizon":'<path d="M240,152H199.55a73.54,73.54,0,0,0,.45-8,72,72,0,0,0-144,0,73.54,73.54,0,0,0,.45,8H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16ZM72,144a56,56,0,1,1,111.41,8H72.59A56.13,56.13,0,0,1,72,144Zm144,56a8,8,0,0,1-8,8H48a8,8,0,0,1,0-16H208A8,8,0,0,1,216,200ZM72.84,43.58a8,8,0,0,1,14.32-7.16l8,16a8,8,0,0,1-14.32,7.16Zm-56,48.84a8,8,0,0,1,10.74-3.57l16,8a8,8,0,0,1-7.16,14.31l-16-8A8,8,0,0,1,16.84,92.42Zm192,15.16a8,8,0,0,1,3.58-10.73l16-8a8,8,0,1,1,7.16,14.31l-16,8a8,8,0,0,1-10.74-3.58Zm-48-55.16,8-16a8,8,0,0,1,14.32,7.16l-8,16a8,8,0,1,1-14.32-7.16Z"/>',sun:'<path d="M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM48,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H40A8,8,0,0,0,48,128Zm80,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,128,208Zm112-88H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z"/>',x:'<path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/>'};function oa(i,e=20){return`<svg viewBox="0 0 256 256" fill="currentColor" width="${e}" height="${e}" aria-hidden="true" focusable="false">${_M[i]||""}</svg>`}var rf=Object.freeze(["\u5199\u5B9E","\u8D5B\u7490\u7490","\u6392\u7EBF","\u7EBF\u7A3F"]),rm=Object.freeze({pedal:{label:"\u8E29\u8E0F",icon:"bicycle"},coast:{label:"\u6ED1\u884C",icon:"arrows-vertical"},brake:{label:"\u5239\u8F66",icon:"arrow-bend-double-up-left"},stop:{label:"\u505C\u8F66",icon:"pause"}}),om="pelican-ride.settings.v1",nf=45,oi=12,MM=i=>document.getElementById(i),sf=i=>`${Math.round(i*100)}%`;function am(i){let e={};for(let F of["view","fade","clock","todLabel","speed","meter","meterFill","cadence","gear","distance","status","statusLabel","spark","sparkTip","toasts","intro","help","settings","error","btnCam","btnTime","btnStyle","btnMusic","btnMute","btnPause","btnPhoto","btnHelp","btnHelpClose","btnSettings","btnSettingsClose","btnStart","btnStartMute","btnReset","btnSculptReset","setSpeed","outSpeed","setOutline","outOutline","setQuality","setVolume","outVolume","setMusic","setDayCycle","setReduced","setDof","setBloom","setBars","setBeak","outBeak","setPouch","outPouch","setNeck","outNeck","setBody","outBody","hints"])e[F]=MM(F);for(let F of document.querySelectorAll("[data-icon]"))F.innerHTML=oa(F.dataset.icon,Number(F.dataset.size)||20);let t=(F,ie)=>{F.querySelector("span[data-icon]").innerHTML=oa(ie)},n=new Map,s=(F,ie,pe)=>{n.get(ie)!==pe&&(n.set(ie,pe),F.textContent=pe)},r=(F,ie,pe,ge)=>{let oe=ie+":"+pe;n.get(oe)!==ge&&(n.set(oe,ge),F.setAttribute(pe,ge))},o={outline:1.6,quality:"auto",volume:80,music:!0,dayCycle:!1,reduced:!1,dof:!0,bloom:!0,bars:!0,sculpt:{beak:1,pouch:1,neck:1,body:1}},a=()=>{try{let F=localStorage.getItem(om);return F?{...o,...JSON.parse(F),sculpt:{...o.sculpt,...JSON.parse(F).sculpt||{}}}:{...o}}catch{return{...o}}},l=F=>{try{localStorage.setItem(om,JSON.stringify(F))}catch{}},c=(F,ie)=>F.addEventListener("click",pe=>{pe.currentTarget.blur(),ie(pe)});c(e.btnStart,()=>i.start(!1)),c(e.btnStartMute,()=>i.start(!0)),c(e.btnCam,()=>i.cam()),c(e.btnTime,()=>i.time()),c(e.btnStyle,()=>i.style()),c(e.btnMusic,()=>i.music()),c(e.btnMute,()=>i.mute()),c(e.btnPause,()=>i.pause()),c(e.btnPhoto,()=>i.photo()),c(e.btnHelp,()=>x(!0)),c(e.btnHelpClose,()=>x(!1)),c(e.btnSettings,()=>p(e.settings.hidden)),c(e.btnSettingsClose,()=>p(!1)),c(e.btnReset,()=>i.reset()),c(e.btnSculptReset,()=>{for(let[F,ie,pe]of h)ie.value=String(o.sculpt[F]),pe.textContent=sf(o.sculpt[F]);i.sculptReset()});for(let F of document.querySelectorAll(".touch__btn")){let ie=F.dataset.act,pe=F.dataset.hold;if(ie&&F.addEventListener("click",()=>i.act(ie)),pe){let ge=Z=>{Z.preventDefault(),i.hold(pe,!0)},oe=()=>i.hold(pe,!1);F.addEventListener("pointerdown",ge),F.addEventListener("pointerup",oe),F.addEventListener("pointercancel",oe),F.addEventListener("pointerleave",oe)}}let u=(F,ie)=>F.addEventListener("input",()=>ie(Number(F.value)));u(e.setSpeed,F=>{e.outSpeed.textContent=`${F} km/h`,i.setTarget(F)}),u(e.setOutline,F=>{e.outOutline.textContent=`${F.toFixed(1)} px`,i.setOutline(F)}),u(e.setVolume,F=>{e.outVolume.textContent=`${F}%`,i.setVolume(F)}),e.setQuality.addEventListener("change",()=>i.setQuality(e.setQuality.value)),e.setMusic.addEventListener("change",()=>i.setMusic(e.setMusic.checked)),e.setDayCycle.addEventListener("change",()=>i.setDayCycle(e.setDayCycle.checked)),e.setReduced.addEventListener("change",()=>i.setReduced(e.setReduced.checked)),e.setDof.addEventListener("change",()=>i.setDof(e.setDof.checked)),e.setBloom.addEventListener("change",()=>i.setBloom(e.setBloom.checked)),e.setBars.addEventListener("change",()=>i.setBars(e.setBars.checked));let h=[["beak",e.setBeak,e.outBeak],["pouch",e.setPouch,e.outPouch],["neck",e.setNeck,e.outNeck],["body",e.setBody,e.outBody]];for(let[F,ie,pe]of h)u(ie,ge=>{pe.textContent=sf(ge),i.sculpt(F,ge)});function f(F,ie={}){e.setSpeed.value=String(Math.round(ie.targetKmh??15)),e.outSpeed.textContent=`${e.setSpeed.value} km/h`,e.setOutline.value=String(F.outline),e.outOutline.textContent=`${Number(F.outline).toFixed(1)} px`,e.setQuality.value=String(F.quality),e.setVolume.value=String(F.volume),e.outVolume.textContent=`${F.volume}%`,e.setMusic.checked=!!F.music,e.setDayCycle.checked=!!F.dayCycle,e.setReduced.checked=!!F.reduced,e.setDof.checked=F.dof!==!1,e.setBloom.checked=F.bloom!==!1,e.setBars.checked=F.bars!==!1;for(let[pe,ge,oe]of h)ge.value=String(F.sculpt[pe]),oe.textContent=sf(F.sculpt[pe])}let d='a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';document.addEventListener("keydown",F=>{if(F.key!=="Tab")return;let ie=document.activeElement,pe=ie&&ie.closest?ie.closest('[aria-modal="true"]'):null;if(!pe)return;let ge=[...pe.querySelectorAll(d)].filter(ee=>ee.getClientRects().length>0);if(!ge.length)return;let oe=ge[0],Z=ge[ge.length-1];F.shiftKey&&ie===oe?(F.preventDefault(),Z.focus()):!F.shiftKey&&ie===Z&&(F.preventDefault(),oe.focus())});let g=null;function x(F){F!==!e.help.hidden&&(e.help.hidden=!F,document.body.classList.toggle("has-modal",F),F?(g=document.activeElement,p(!1),e.btnHelpClose.focus()):(g&&g.focus?g:e.view).focus({preventScroll:!0}),i.modal&&i.modal(F))}function p(F){F!==!e.settings.hidden&&(e.settings.hidden=!F,r(e.btnSettings,"settings","aria-expanded",String(F)),F?(g=document.activeElement,e.btnSettingsClose.focus()):(g&&g.focus?g:e.view).focus({preventScroll:!0}),i.modal&&i.modal(F))}e.help.addEventListener("pointerdown",F=>{F.target===e.help&&x(!1)}),e.settings.hidden=!0,e.help.hidden=!0;function m(F,ie){document.body.classList.toggle("is-intro",F),document.body.classList.toggle("intro-leaving",!!ie),F&&e.btnStart.focus({preventScroll:!0})}function y(F){document.body.classList.toggle("hide-ui",F)}function _(F){document.body.classList.toggle("reduce-motion",F)}function v(F){e.fade.style.opacity=String(Math.max(0,Math.min(1,F)))}function w(F){if(!F){e.error.hidden=!0;return}e.error.textContent=F,e.error.hidden=!1}function S(F,ie){for(;e.toasts.children.length>=3;)e.toasts.firstElementChild.remove();let pe=document.createElement("div");if(pe.className="toast",ie){let ge=document.createElement("span");ge.innerHTML=oa(ie,18),ge.setAttribute("aria-hidden","true"),pe.append(ge)}pe.append(document.createTextNode(F)),e.toasts.append(pe),setTimeout(()=>{pe.classList.add("is-leaving"),setTimeout(()=>pe.remove(),320)},4800)}let E=6,A=214,b=38,M=6,R=F=>E+(A-E)*F/(oi-1),L=F=>b-(b-M)*Math.max(0,Math.min(nf,F))/nf,U=new Array(oi).fill(0),V=-1;function X(){let F=U.map((Ee,Te)=>[R(Te),L(Ee)]),ie="";F.forEach(([Ee,Te],Ae)=>{ie+=(Ae?"L":"M")+Ee.toFixed(1)+" "+Te.toFixed(1)});let pe=ie+`L${A} ${b}L${E} ${b}Z`,[ge,oe]=F[oi-1],[Z]=F[oi-2],ee=V>=0?`<line class="spark__cross" x1="${R(V)}" y1="${M-3}" x2="${R(V)}" y2="${b+2}"/><circle class="spark__hover" cx="${R(V)}" cy="${L(U[V])}" r="5"/>`:"";e.spark.innerHTML=`<line class="spark__grid" x1="${E}" y1="${b}" x2="${A}" y2="${b}"/><line class="spark__grid" x1="${E}" y1="${M}" x2="${A}" y2="${M}"/><text class="spark__tick" x="${A}" y="${M-3}" text-anchor="end">45</text><path class="spark__area" d="${pe}"/><path class="spark__line" d="${ie}"/><path class="spark__last" d="M${Z.toFixed(1)} ${F[oi-2][1].toFixed(1)}L${ge.toFixed(1)} ${oe.toFixed(1)}"/><circle class="spark__ring" cx="${ge}" cy="${oe}" r="6"/><circle class="spark__dot" cx="${ge}" cy="${oe}" r="4"/>`+ee;let ye=Math.max(...U);r(e.spark,"spark","aria-label",`\u8FD1 30 \u79D2\u901F\u5EA6\u6298\u7EBF\u3002\u6700\u65B0 ${U[oi-1].toFixed(1)} \u516C\u91CC\u6BCF\u5C0F\u65F6\uFF0C\u6700\u9AD8 ${ye.toFixed(1)} \u516C\u91CC\u6BCF\u5C0F\u65F6\uFF0C\u91CF\u7A0B 0 \u5230 45\u3002`)}let $=F=>{let ie=e.spark.getBoundingClientRect(),pe=((F-ie.left)/ie.width*220-E)/(A-E);return pe<-.04||pe>1.04?-1:Math.max(0,Math.min(oi-1,Math.round(pe*(oi-1))))};function K(F){if(V=F,F<0){e.sparkTip.hidden=!0,X();return}let ie=(oi-1-F)*2.5;e.sparkTip.textContent=ie?`${ie.toFixed(1)} \u79D2\u524D \xB7 ${U[F].toFixed(1)} km/h`:`\u73B0\u5728 \xB7 ${U[F].toFixed(1)} km/h`,e.sparkTip.hidden=!1,e.sparkTip.style.left=`${R(F)/220*100}%`,X()}e.spark.tabIndex=0,e.spark.addEventListener("pointermove",F=>K($(F.clientX))),e.spark.addEventListener("pointerleave",()=>K(-1)),e.spark.addEventListener("focus",()=>K(V<0?oi-1:V)),e.spark.addEventListener("blur",()=>K(-1)),e.spark.addEventListener("keydown",F=>{F.key!=="ArrowLeft"&&F.key!=="ArrowRight"||(F.preventDefault(),F.stopPropagation(),K(Math.max(0,Math.min(oi-1,(V<0?oi-1:V)+(F.key==="ArrowLeft"?-1:1)))))});let O=document.createElement("style");O.textContent=".spark__grid{stroke:var(--paper-3);stroke-width:1}.spark__tick{font:500 12px/16px var(--font-ui);fill:var(--ink-2)}.spark__area{fill:var(--coral);opacity:.1}.spark__line{fill:none;stroke:var(--ink-3);stroke-width:2;stroke-linejoin:round;stroke-linecap:round}.spark__last{fill:none;stroke:var(--coral);stroke-width:2;stroke-linecap:round}.spark__dot{fill:var(--coral)}.spark__ring{fill:var(--paper)}.spark__hover{fill:var(--coral);stroke:var(--paper);stroke-width:2}.spark__cross{stroke:var(--ink-3);stroke-width:1}",document.head.append(O);let j=0;function J(F,ie){s(e.speed,"speed",F.speedKmh.toFixed(1));let pe=Math.max(0,Math.min(1,F.speedKmh/nf));r(e.meterFill,"meter","stroke-dashoffset",(209.4*(1-pe)).toFixed(1)),r(e.meterFill,"meterDash","stroke-dasharray",pe<.004?"0.01 209.4":"209.4"),r(e.meter,"meterA","aria-valuenow",String(Math.round(F.speedKmh))),s(e.cadence,"cad",String(Math.round(F.cadence))),s(e.gear,"gear",String(F.gear+1)),s(e.distance,"dist",F.distanceKm.toFixed(2));let ge=rm[F.mode]||rm.stop;s(e.statusLabel,"mode",ge.label),r(e.status,"mode","data-status",F.mode),s(e.clock,"clock",F.clock),s(e.todLabel,"tod",F.todLabel),n.get("todIcon")!==F.todIcon&&(n.set("todIcon",F.todIcon),document.querySelector(".chip--clock .chip__icon").innerHTML=oa(F.todIcon,18)),r(e.btnCam,"cam","aria-label",`\u5207\u6362\u955C\u5934\uFF0C\u5F53\u524D\uFF1A${F.camLabel}`),r(e.btnCam,"camT","title",`${F.camLabel}\uFF1A${F.camHint} (C)`),r(e.btnTime,"time","aria-label",`\u5207\u6362\u65F6\u523B\uFF0C\u5F53\u524D\uFF1A${F.todLabel}`),r(e.btnStyle,"style","aria-label",`\u5207\u6362\u753B\u98CE\uFF0C\u5F53\u524D\uFF1A${F.styleLabel}`);let oe="m"+F.muted;n.get("mute")!==oe&&(n.set("mute",oe),r(e.btnMute,"mute","aria-pressed",String(F.muted)),r(e.btnMute,"muteL","aria-label",F.muted?"\u53D6\u6D88\u9759\u97F3":"\u9759\u97F3"),t(e.btnMute,F.muted?"speaker-slash":"speaker-high"),e.btnMute.classList.toggle("is-off",F.muted));let Z="mu"+F.music;n.get("music")!==Z&&(n.set("music",Z),r(e.btnMusic,"music","aria-pressed",String(F.music)),r(e.btnMusic,"musicL","aria-label",F.music?"\u97F3\u4E50\uFF1A\u5F00":"\u97F3\u4E50\uFF1A\u5173"),e.btnMusic.classList.toggle("is-off",!F.music));let ee="p"+F.paused;n.get("paused")!==ee&&(n.set("paused",ee),r(e.btnPause,"paused","aria-pressed",String(F.paused)),r(e.btnPause,"pausedL","aria-label",F.paused?"\u7EE7\u7EED":"\u6682\u505C"),t(e.btnPause,F.paused?"play":"pause")),j+=ie,j>=2.5?(j=0,U.push(F.speedKmh),U.shift(),X()):n.get("sLast")!==F.speedKmh.toFixed(1)&&(n.set("sLast",F.speedKmh.toFixed(1)),U[oi-1]=F.speedKmh,V<0&&X())}return{update:J,toast:S,setIntro:m,setPhoto:y,setReduced:_,fade:v,error:w,openHelp:x,openSettings:p,reflectSettings:f,loadSettings:a,saveSettings:l,defaults:o,get settingsOpen(){return!e.settings.hidden},get helpOpen(){return!e.help.hidden},setTargetSlider:F=>{e.setSpeed.value=String(Math.round(F)),e.outSpeed.textContent=`${Math.round(F)} km/h`},el:e}}var Me=(i,e,t)=>[i,e,t],Ms={sunAz:305,sunEl:46,sunColor:Me(.4,.5,.86),sunDisc:0,moon:1,stars:1,litTint:Me(.6,.68,1),shadeTint:Me(.27,.32,.66),coreTint:Me(.66,.68,.86),rimColor:Me(.72,.8,1),rimStrength:.42,terminator:.18,skyTop:Me(.035,.055,.16),skyHorizon:Me(.16,.22,.44),sunGlow:Me(.3,.36,.66),seaDeep:Me(.035,.1,.24),seaShallow:Me(.1,.34,.5),seaFoam:Me(.78,.86,1),seaSpec:Me(.85,.9,1),sand:Me(.62,.6,.72),grass:Me(.22,.4,.42),ink:Me(.045,.055,.13),lamps:1,fogDensity:1,exposure:1,cloud:Me(.3,.34,.52),cloudShade:Me(.14,.17,.32)},SM={sunAz:268,sunEl:-4,sunColor:Me(.7,.56,.86),sunDisc:0,moon:.35,stars:.45,litTint:Me(.96,.84,.98),shadeTint:Me(.46,.4,.78),coreTint:Me(.7,.66,.9),rimColor:Me(1,.74,.62),rimStrength:.5,terminator:.22,skyTop:Me(.16,.18,.44),skyHorizon:Me(.98,.56,.44),sunGlow:Me(1,.62,.46),seaDeep:Me(.1,.12,.32),seaShallow:Me(.36,.28,.48),seaFoam:Me(.96,.8,.82),seaSpec:Me(1,.72,.56),sand:Me(.72,.56,.62),grass:Me(.26,.3,.44),ink:Me(.1,.07,.17),lamps:.85,fogDensity:1.05,exposure:1,cloud:Me(.86,.54,.56),cloudShade:Me(.46,.32,.56)},bM={sunAz:262,sunEl:7,sunColor:Me(1,.74,.5),sunDisc:1,moon:0,stars:0,litTint:Me(1.08,.94,.82),shadeTint:Me(.58,.54,.9),coreTint:Me(.76,.72,.94),rimColor:Me(1,.84,.62),rimStrength:.55,terminator:.24,skyTop:Me(.3,.46,.82),skyHorizon:Me(1,.74,.5),sunGlow:Me(1,.72,.46),seaDeep:Me(.09,.34,.56),seaShallow:Me(.42,.7,.74),seaFoam:Me(1,.94,.9),seaSpec:Me(1,.88,.62),sand:Me(.93,.74,.56),grass:Me(.4,.62,.42),ink:Me(.16,.11,.25),lamps:.15,fogDensity:1,exposure:1,cloud:Me(1,.88,.78),cloudShade:Me(.78,.58,.72)},EM={sunAz:232,sunEl:40,sunColor:Me(1,.94,.84),sunDisc:1,moon:0,stars:0,litTint:Me(1.04,1,.94),shadeTint:Me(.6,.66,.95),coreTint:Me(.8,.79,.93),rimColor:Me(1,.98,.92),rimStrength:.4,terminator:.22,skyTop:Me(.2,.58,.92),skyHorizon:Me(.76,.9,.97),sunGlow:Me(1,.96,.84),seaDeep:Me(.06,.52,.74),seaShallow:Me(.34,.84,.84),seaFoam:Me(1,1,1),seaSpec:Me(1,1,.96),sand:Me(.95,.85,.62),grass:Me(.46,.78,.42),ink:Me(.13,.12,.26),lamps:0,fogDensity:1,exposure:1,cloud:Me(1,1,1),cloudShade:Me(.74,.78,.94)},TM={sunAz:190,sunEl:66,sunColor:Me(1,.98,.92),sunDisc:1,moon:0,stars:0,litTint:Me(1.03,1.01,.97),shadeTint:Me(.62,.7,.98),coreTint:Me(.82,.82,.96),rimColor:Me(1,1,1),rimStrength:.34,terminator:.2,skyTop:Me(.16,.52,.92),skyHorizon:Me(.8,.92,.98),sunGlow:Me(1,1,.94),seaDeep:Me(.05,.55,.78),seaShallow:Me(.36,.88,.86),seaFoam:Me(1,1,1),seaSpec:Me(1,1,1),sand:Me(.97,.88,.66),grass:Me(.48,.8,.4),ink:Me(.13,.12,.26),lamps:0,fogDensity:.9,exposure:1,cloud:Me(1,1,1),cloudShade:Me(.76,.8,.96)},wM={sunAz:112,sunEl:30,sunColor:Me(1,.9,.74),sunDisc:1,moon:0,stars:0,litTint:Me(1.06,.98,.9),shadeTint:Me(.64,.66,.96),coreTint:Me(.82,.8,.94),rimColor:Me(1,.96,.86),rimStrength:.4,terminator:.22,skyTop:Me(.26,.6,.92),skyHorizon:Me(.88,.88,.86),sunGlow:Me(1,.94,.8),seaDeep:Me(.07,.5,.72),seaShallow:Me(.38,.82,.82),seaFoam:Me(1,1,1),seaSpec:Me(1,.98,.9),sand:Me(.95,.84,.64),grass:Me(.46,.78,.42),ink:Me(.14,.12,.26),lamps:0,fogDensity:1.15,exposure:1,cloud:Me(1,.98,.96),cloudShade:Me(.78,.8,.92)},AM={sunAz:94,sunEl:5,sunColor:Me(1,.78,.64),sunDisc:1,moon:.15,stars:.12,litTint:Me(1.08,.96,.9),shadeTint:Me(.66,.62,.94),coreTint:Me(.82,.78,.94),rimColor:Me(1,.86,.74),rimStrength:.55,terminator:.24,skyTop:Me(.36,.54,.84),skyHorizon:Me(1,.78,.66),sunGlow:Me(1,.78,.6),seaDeep:Me(.14,.4,.62),seaShallow:Me(.52,.74,.78),seaFoam:Me(1,.96,.94),seaSpec:Me(1,.86,.7),sand:Me(.93,.78,.66),grass:Me(.44,.66,.48),ink:Me(.18,.13,.27),lamps:.25,fogDensity:1.5,exposure:1,cloud:Me(1,.86,.82),cloudShade:Me(.8,.66,.8)},zc=Object.freeze([{h:0,p:Ms},{h:4.4,p:Ms},{h:6,p:AM},{h:8.6,p:wM},{h:12.6,p:TM},{h:15.8,p:EM},{h:18.2,p:bM},{h:19.3,p:SM},{h:20.6,p:Ms},{h:24,p:Ms}]),Wr=Object.freeze([{id:"dawn",label:"\u6E05\u6668",h:6.1,emoji:"\u{1F305}"},{id:"day",label:"\u767D\u5929",h:13,emoji:"\u2600\uFE0F"},{id:"sunset",label:"\u9EC4\u660F",h:18.2,emoji:"\u{1F307}"},{id:"night",label:"\u591C\u665A",h:22,emoji:"\u{1F319}"}]),lm=Object.keys(Ms).filter(i=>Array.isArray(Ms[i])),cm=Object.keys(Ms).filter(i=>!Array.isArray(Ms[i])),Ww=[...lm,...cm];function RM(i,e,t,n){for(let s=0;s<3;s++)n[s]=st(i[s],e[s],t);return n}function of(i,e={}){i=(i%24+24)%24;let t=0;for(;t<zc.length-2&&i>=zc[t+1].h;)t++;let n=zc[t],s=zc[t+1],r=wt((i-n.h)/(s.h-n.h)),o=r*r*(3-2*r);for(let a of lm)e[a]=e[a]||[0,0,0],RM(n.p[a],s.p[a],o,e[a]);for(let a of cm)e[a]=st(n.p[a],s.p[a],o);return e.hour=i,e.label=aa(i).label,e}function aa(i){i=(i%24+24)%24;let e=Wr[0],t=1e9;for(let n of Wr){let s=Math.abs(n.h-i);s=Math.min(s,24-s),s<t&&(t=s,e=n)}return e}function um(i){i=(i%24+24)%24;let e=Math.floor(i),t=Math.floor((i-e)*60);return`${String(e).padStart(2,"0")}:${String(t).padStart(2,"0")}`}var hm=9.81,la=12.5,un=Object.freeze({STOP:"stop",PEDAL:"pedal",COAST:"coast",BRAKE:"brake"});function fm(i={}){return{v:i.v??0,target:i.target??i.v??0,mode:(i.v??0)>.05?un.PEDAL:un.STOP,crank:i.crank??Math.PI*.5,crankVel:0,wheel:0,crankTravel:0,distance:0,gear:i.gear??1,slope:0,air:!1,airY:0,airVy:0,airTime:0,landImpact:0,jumpCooldown:0,accel:0,time:0,pedalPower:0,stats:{topSpeed:0,jumps:0,coastTime:0,time:0}}}function dm(i,e,t={}){let n=[];e=Math.min(Math.max(e,0),.1),t.gear!==void 0&&t.gear!==i.gear&&(i.gear=ct(t.gear|0,0,2),n.push({type:"shift",gear:i.gear})),t.target!==void 0&&(i.target=ct(t.target,0,la)),t.slope!==void 0&&(i.slope=ct(t.slope,-.14,.14)),i.jumpCooldown=Math.max(0,i.jumpCooldown-e),t.jump&&!i.air&&i.jumpCooldown<=0&&(i.air=!0,i.airVy=4.4,i.airTime=0,i.jumpCooldown=.25,i.stats.jumps++,n.push({type:"jump",v:i.v})),i.air?(i.airTime+=e,i.airVy-=hm*e,i.airY+=i.airVy*e,i.airY<=0&&(n.push({type:"land",impact:-i.airVy,v:i.v}),i.landImpact=-i.airVy,i.airY=0,i.airVy=0,i.air=!1)):i.landImpact=0;let s=i.v,r=0,o=i.target-i.v,a=c=>.62*c*(1-.6*i.v/la)*(i.air?0:1),l;if(i.target<=.03&&i.v<=.03?l=un.STOP:o>.06?l=un.PEDAL:o<-1.3||i.target<=.03&&i.v>.03?l=un.BRAKE:o<-.06?l=un.COAST:l=un.PEDAL,l===un.COAST&&i.v<=i.target+.03&&(l=un.PEDAL),l===un.PEDAL&&o<=.06){let c=i.v-i.target;c>.25?l=un.COAST:(r+=o>0?a(o):o*1.1,c<-.25&&(r+=a(-c)))}if(l===un.PEDAL&&o>.06&&(r+=a(o)),l===un.COAST&&(r-=.55),l===un.BRAKE&&(r-=4.2),r+=-hm*i.slope*(l===un.BRAKE?.35:.9),l===un.BRAKE&&r<-5.5&&(r=-5.5),i.mode=l,i.v=Math.min(Math.max(i.v+r*e,0),la),i.v<=.02&&i.target<=.03&&(i.v=0,i.mode=un.STOP),i.accel=e>0?(i.v-s)/e:0,i.mode===un.PEDAL&&i.v>.02&&!i.air){i.crankVel=i.v/(ze.wheelR*p0(i.gear));let c=i.crankVel*e;i.crank=(i.crank+c)%He,i.crankTravel+=i.v*e,i.pedalPower=ct(.35+Math.max(r,0)*.5+i.slope*3+o*.2,.15,1)}else{i.crankVel=0;let c=Math.round((i.crank-Math.PI/2)/Math.PI)*Math.PI+Math.PI/2,u=i.crank+(((c-i.crank+Math.PI)%He+He)%He-Math.PI)*(1-Math.exp(-7*e));i.crank=(u+He)%He,i.pedalPower=0}return i.wheel+=i.v*e/ze.wheelR,i.distance+=i.v*e,i.time+=e,i.stats.time+=e,i.v>i.stats.topSpeed&&(i.stats.topSpeed=i.v),i.mode===un.COAST&&(i.stats.coastTime+=e),n}var Fi=new URLSearchParams(location.search),Ss=(i,e)=>{let t=parseFloat(Fi.get(i));return Number.isFinite(t)?t:e},af=i=>document.getElementById(i),lf=window.matchMedia?window.matchMedia("(prefers-reduced-motion: reduce)"):{matches:!1},pm={dawn:"sun-horizon",day:"sun",sunset:"sun-horizon",night:"moon-stars"};function CM(){let i=af("view"),e=[],t=B=>{let Ne=af("error");Ne.textContent=B,Ne.hidden=!1};if(window.addEventListener("error",B=>{e.push(String(B.message)),console.error("[pelican]",B.message)}),!document.createElement("canvas").getContext("webgl2")){t("\u8FD9\u4E2A\u6D4F\u89C8\u5668\u6CA1\u6709\u53EF\u7528\u7684 WebGL2\uFF0C\u753B\u9762\u65E0\u6CD5\u663E\u793A\u3002\u8BF7\u6362\u7528\u65B0\u7248 Edge\u3001Chrome\u3001Firefox \u6216 Safari \u518D\u6253\u5F00\u3002");return}let n={phase:Fi.get("intro")==="0"?"ride":"intro",paused:Fi.get("paused")==="1",userPaused:!1,photo:Fi.get("ui")==="0",hidden:!1,hour:Ss("hour",15.4),hourTarget:null,autoTime:Fi.get("daycycle")==="1",style:ct(Math.round(Ss("style",0)),0,3),focus:6,s:Ss("s",64),time:0,targetKmh:Ss("target",15),muted:!1,music:!0,reduced:lf.matches,quality:"auto",qLevel:2,dprCap:2,frameCost:0,fpsDone:!1,jump:!1,ringBell:!1,squawkT:-1,lookCamUntil:0,glanceIn:5,fish:null,lastFish:-9,inspector:Fi.get("inspect")==="1",wasNight:!1,freeze:Fi.get("freeze")==="1",hudT:0,fadeT:-1,seen:{},debugCam:null},s=ph(),r=$d(i,s,{shadowSize:2048,shadowExtent:17}),o=Tc(),a=performance.now(),l=_0(s,{track:o,quality:2}),c=performance.now()-a;r.scene.add(l.group);let u=I0(s);r.scene.add(u.hero);let h=u.bike,f=O0(r.camera,{reducedMotion:()=>n.reduced,onFov:()=>r.syncCameraUniforms()}),d=sm(),g=of(n.hour,{}),x={},p=fm({v:0,target:0}),m={target:0,gear:1,slope:0,jump:!1},y=(n.s%o.length+o.length)%o.length,_={yaw:0,pitch:0,roll:0,w:0,yawT:0,pitchT:0},v=new D,w=new D,S=new Ut,E=new D,A=new Ut,b={v:0,crankVel:0,mode:"stop",pedalPower:0,air:!1,gear:1},M={hour:n.hour,cadence:0,wind:0},R=cc(s,16773316,{opacity:0,power:.7}),L=new Bn(.06,1.7,10,16,1,!0);{let B=L.attributes.uv;for(let Ne=0;Ne<B.count;Ne++)B.setY(Ne,1-B.getY(Ne))}let U=new $e(L.rotateX(-Math.PI/2).translate(0,.842-.5,.62+5),R);U.name="headBeam",U.castShadow=!1,U.frustumCulled=!1,u.hero.add(U);let V=Mp(r,s,{world:l});l.enableReal(V),V.postHide.push(U,l.lighthouse.beam);let X=Ap(r.renderer,r.scene,r.camera,V.postHide),$={on:!1,pos:new D,dir:new D(0,0,1),level:0},K=new at;K.name="inspector",K.visible=n.inspector,u.hero.add(K);let O=new Bn(1,1,1,8,1),j=new $n(1,12,8),J=(B,Ne)=>{let Ke=new $e(B,new Xi({color:Ne,depthTest:!1,transparent:!0,fog:!1}));return Ke.renderOrder=999,Ke.frustumCulled=!1,K.add(Ke),Ke},F=14239791,ie=1929144,pe=1907258,ge=new D(0,1,0),oe=new D,Z=(B,Ne,Ke,C)=>{oe.subVectors(Ke,Ne);let Q=oe.length()||1e-6;B.position.copy(Ne).addScaledVector(oe,.5),B.quaternion.setFromUnitVectors(ge,oe.multiplyScalar(1/Q)),B.scale.set(C,Q,C)},ee=(B,Ne,Ke)=>{B.position.copy(Ne),B.scale.setScalar(Ke)},ye={leg:[[J(O,F),J(O,F)],[J(O,F),J(O,F)]],arm:[[J(O,ie),J(O,ie)],[J(O,ie),J(O,ie)]],spine:J(O,pe)},Ee={hip:[J(j,F),J(j,F)],knee:[J(j,F),J(j,F)],ankle:[J(j,F),J(j,F)],sh:[J(j,ie),J(j,ie)],el:[J(j,ie),J(j,ie)],wrist:[J(j,ie),J(j,ie)],head:J(j,pe)},Te=[J(j,pe),J(j,pe)];for(let B of[1,-1]){let Ne=J(new ks(ze.crank,.0075,6,64),pe);Ne.rotation.y=Math.PI/2,Ne.position.set(B*ze.pedalX,ze.bb[1],ze.bb[2])}let Ae={outline:1.6,quality:"auto",volume:80,music:!0,dayCycle:!1,reduced:n.reduced,dof:!0,bloom:!0,bars:!0,sculpt:{beak:1,pouch:1,neck:1,body:1}},Re=am({start:xt,setTarget:B=>{n.targetKmh=B},setOutline:B=>{Ae.outline=B,s.uOutlinePx.value=B,ce()},setQuality:B=>{Y(B),ce()},setVolume:B=>{Ae.volume=B,d.setVolume(B/100),ce()},setMusic:B=>{n.music=B,d.setMusicEnabled(B),ce()},setDayCycle:B=>{n.autoTime=B,ce()},setReduced:B=>{n.reduced=B,Re.setReduced(B),ce()},setDof:B=>{Ae.dof=B,X.dofWanted=B,X.setQuality(n.qLevel),ce()},setBloom:B=>{Ae.bloom=B,T(n.qLevel),ce()},setBars:B=>{Ae.bars=B,de(),ce()},sculpt:(B,Ne)=>{Ae.sculpt[B]=Ne,fe=!0,ce()},sculptReset:()=>{Ae.sculpt={beak:1,pouch:1,neck:1,body:1},Ni(Ae.sculpt),ce()},reset:()=>Se(),cam:()=>xe(1),time:()=>Ie(),style:()=>We(),music:()=>Fe(),mute:()=>Je(),pause:()=>q(),photo:()=>Ce(),hold:(B,Ne)=>St.setHeld(B,Ne),act:B=>et(B),modal:B=>{n.paused=B||n.userPaused}}),N=Re.loadSettings();Object.assign(Ae,N),n.music=Ae.music,n.autoTime=Ae.dayCycle||n.autoTime,n.reduced=Ae.reduced||lf.matches;let fe=!1,le=0;["beak","pouch","neck","body"].some(B=>Ae.sculpt[B]!==1)&&u.setSculpt(Ae.sculpt);function ce(){Ae.reduced=n.reduced,Ae.dayCycle=n.autoTime,Ae.music=n.music,Re.saveSettings(Ae)}function de(){document.body.classList.toggle("has-bars",!!Ae.bars&&n.style===0)}Re.reflectSettings(Ae,{targetKmh:n.targetKmh}),Re.setReduced(n.reduced),Re.setPhoto(n.photo),s.uStyle.value=Math.max(0,n.style-1);function Y(B){if(B==="auto"||B===void 0){n.quality="auto",n.fpsDone=!1,W(2),I();return}n.quality=String(B),W(Number(B))}let G=r.renderer.getContext(),H=new Uint8Array(4);function se(B=10,Ne=4){for(let C=0;C<Ne;C++)Rt(1/60),G.readPixels(0,0,1,1,G.RGBA,G.UNSIGNED_BYTE,H);let Ke=performance.now();for(let C=0;C<B;C++)Rt(1/60),G.readPixels(0,0,1,1,G.RGBA,G.UNSIGNED_BYTE,H);return(performance.now()-Ke)/B}function me(B){let Ne=[n.qLevel,n.dprCap];n.qLevel=B,n.dprCap=[1,1.4,2][B],ve(),T(B),P();let Ke=Math.min(se(12),se(12));return[n.qLevel,n.dprCap]=Ne,ve(),T(Ne[0]),P(),Ke}function I(){if(n.quality!=="auto"||n.freeze||n.hidden)return n.frameCost;let B=me(2),Ne=2;return B>19&&(B=me(1),Ne=1),B>26&&(B=me(0),Ne=0),Ne!==n.qLevel?W(Ne):P(),n.frameCost=B,n.fpsDone=!0,B}function T(B){l.setQuality(B),X.bloom.enabled=Ae.bloom,X.setQuality(B),s.uFadeFar.value=[70,90,95][B],r.shadowEnabled=B>0,r.setShadowExtent(V.real?26:17)}function W(B){B!==n.qLevel&&(n.qLevel=B,n.dprCap=[1,1.4,2][B],ve(),T(B),P())}let te=new be;function ve(){r.resize(i.clientWidth||innerWidth,i.clientHeight||innerHeight,Math.min(devicePixelRatio||1,n.dprCap)),X&&(r.renderer.getDrawingBufferSize(te),X.setSize(te.x,te.y))}function P(){r.applyPalette(g,u.hero.position),l.applyPalette(g),s.uOutlinePx.value=Ae.outline,V.real&&V.applyLook(g,u.hero.position)}function z(){let B=n.style===0,Ne=n.povOn;V.set(B),n.povOn=!1,_n=[],Ne&&At(!0),document.body.classList.toggle("is-real",B),de(),T(n.qLevel),B?V.applyLook(g,u.hero.position):P()}function ne(B){n.hour=(B%24+24)%24,of(n.hour,g),P()}function k(B,Ne){n.seen[B]||(n.seen[B]=!0,Ne())}function ue(){let B=f.mode;Re.toast(`\u955C\u5934\uFF1A${B.label}\uFF0C${B.hint}`,"camera")}function xe(B){f.cycle(B),d.sfx.click(),ue()}function Ie(){let B=Wr.findIndex(Ke=>Ke.id===aa(n.hour).id),Ne=Wr[(B+1)%Wr.length];n.hourTarget=Ne.h,n.autoTime=!1,Re.toast(`\u65F6\u523B\uFF1A${Ne.label}`,pm[Ne.id]),d.sfx.toggle()}function Ge(){n.autoTime=!n.autoTime,Re.toast(n.autoTime?"\u663C\u591C\u6D41\u8F6C\uFF1A\u5F00\uFF0C\u7EA6 8 \u5206\u949F\u4E00\u5929":"\u663C\u591C\u6D41\u8F6C\uFF1A\u5173","sun-horizon"),ce()}function We(){n.style=(n.style+1)%4,z(),Re.toast(`\u753B\u98CE\uFF1A${rf[n.style]}`,"sparkle"),d.sfx.toggle()}function Fe(){n.music=!n.music,d.setMusicEnabled(n.music),Re.toast(n.music?"\u97F3\u4E50\uFF1A\u5F00\uFF0C\u8282\u62CD\u8DDF\u7740\u8E0F\u9891\u8D70":"\u97F3\u4E50\uFF1A\u5173","music-notes"),ce()}function Je(){n.muted=!n.muted,d.setMuted(n.muted),Re.toast(n.muted?"\u5DF2\u9759\u97F3\uFF0C\u6309 M \u6062\u590D":"\u58F0\u97F3\uFF1A\u5F00",n.muted?"speaker-slash":"speaker-high")}function q(){n.phase==="ride"&&(n.paused=!n.paused,n.userPaused=n.paused,n.paused&&Re.toast("\u5DF2\u6682\u505C\uFF0C\u6309 P \u7EE7\u7EED","pause"))}function Ce(){n.photo=!n.photo,Re.setPhoto(n.photo),n.photo||Re.toast("\u754C\u9762\u5DF2\u663E\u793A","eye-slash")}function De(){n.ringBell=!0,d.sfx.bell();let B=l.gullFlock.nearCount(u.hero.position);l.gullFlock.scatter(u.hero.position),k("bell",()=>Re.toast(B>0?"\u8F66\u94C3\u54CD\u4E86\u4E24\u58F0\uFF0C\u9644\u8FD1\u7684\u6D77\u9E25\u98DE\u5F00\u4E86":"\u8F66\u94C3\u54CD\u4E86\u4E24\u58F0","bell"))}function ke(B){n.squawkT=0,B&&(n.lookCamUntil=n.time+2.4),d.sfx.squawk()}function Pe(B){let Ne=B||l.randomSeaPoint(n.s,v).clone();return n.fish=l.fishJump(Ne),n.fish&&k("fish",()=>Re.toast("\u6709\u9C7C\u8DC3\u51FA\u6C34\u9762","fish")),n.fish}function Se(){n.s=y,p.v=0,p.target=0,p.crank=Math.PI/2,n.paused=!1,n.userPaused=!1,f.reset(),Re.toast("\u56DE\u5230\u51FA\u53D1\u70B9","arrow-clockwise"),d.sfx.click()}function Ve(B,Ne){let Ke=new Fo;if(Ke.setFromCamera(new be(B,Ne),r.camera),Ke.intersectObject(u.pelican.root,!0).find(Q=>!Q.object.userData.isOutline&&!/^scarf/.test(Q.object.name))){ke(!0);return}if(n.time-n.lastFish>.5){n.lastFish=n.time;let Q=l.hitSea(Ke);Q&&Pe(Q.point)}}function et(B){if(n.phase==="intro"){(B==="enter"||B==="jump")&&xt(!1);return}if(B==="help"){Re.openHelp(!Re.helpOpen);return}if(B==="escape"){Re.helpOpen?Re.openHelp(!1):Re.settingsOpen?Re.openSettings(!1):n.photo&&Ce();return}Re.helpOpen||(B==="jump"?n.paused||(n.jump=!0):B==="bell"?De():B==="gear"?(n.paused||(m.gear=(p.gear+1)%3),d.sfx.shift()):B==="cam"?xe(1):B.startsWith("cam")?f.setMode(Number(B.slice(3)))&&(d.sfx.click(),ue()):B==="time"?Ie():B==="cycle"?Ge():B==="style"?We():B==="music"?Fe():B==="mute"?Je():B==="pause"?q():B==="photo"?Ce():B==="inspect"?(n.inspector=!n.inspector,K.visible=n.inspector,d.sfx.toggle(),n.inspector&&Re.toast("\u68C0\u89C6\uFF1A\u7EA2 = \u817F\u3001\u84DD = \u7FC5\u8180\u4E0E\u56F4\u5DFE\uFF0C\u5706\u5708\u662F\u8E0F\u9891\u8F68\u8FF9","info")):B==="reset"?Se():B==="squawk"?ke(!0):B==="fish"&&Pe())}let St=H0(i,{onOrbit:(B,Ne)=>f.orbit(B,Ne),onZoom:B=>f.zoom(B),onPick:Ve,onAction:et});function xt(B){n.phase==="intro"&&(d.unlock(),d.setMuted(B),n.muted=B,d.setVolume(Ae.volume/100),d.setMusicEnabled(n.music),n.phase="ride",Re.setIntro(!0,!0),setTimeout(()=>Re.setIntro(!1,!1),650),f.index===3?f.setMode(0):f.reset(),af("stage").focus({preventScroll:!0}),d.sfx.click(),k("ride",()=>Re.toast("\u51FA\u53D1\u3002\u6D77\u5728\u53F3\u624B\u8FB9\uFF0C\u2191 \u2193 \u8C03\u901F\uFF0C\u7A7A\u683C\u8DF3\u4E00\u4E0B","bicycle")),setTimeout(()=>{n.quality==="auto"&&!n.fpsDone&&I()},900))}function Vn(B){let Ne=.09*Math.sin(n.time*.37),Ke=-.03,C=0,Q=u.pelican.headNode;n.fish&&n.fish.alive?(v.copy(n.fish.position),u.hero.worldToLocal(v).sub(Q.position),v.length()<45?(Ne=ct(Math.atan2(v.x,v.z),-1.15,1.15),Ke=ct(-Math.atan2(v.y,Math.hypot(v.x,v.z)),-.5,.35),C=1):n.fish=null):n.fish=null,n.glanceIn-=B,n.glanceIn<-1.6&&(n.glanceIn=6+Math.random()*5),w.copy(r.camera.position),u.hero.worldToLocal(w).sub(Q.position);let ae=w.length(),he=w.z>.15*ae;(n.time<n.lookCamUntil||n.glanceIn<0&&ae<6.5&&he)&&(Ne=ct(Math.atan2(w.x,w.z),-1.2,1.2),Ke=ct(-Math.atan2(w.y,Math.hypot(w.x,w.z)),-.5,.5),C=1),_.w=pn(_.w,C,8,B),_.yawT=pn(_.yawT,Ne,10,B),_.pitchT=pn(_.pitchT,Ke,10,B),_.yaw=_.yawT*_.w,_.pitch=_.pitchT*_.w,_.roll=_.yaw*.12}function Tn(B){if(n.time+=B,n.hourTarget!==null){let ae=(n.hourTarget-n.hour+36)%24-12;ne(n.hour+ae*Math.min(1,B*2.2)),Math.abs(ae)<.01&&(ne(n.hourTarget),n.hourTarget=null)}else n.autoTime&&ne(n.hour+B*(24/480));let Ne=g.lamps>.5;Ne!==n.wasNight&&n.phase==="ride"&&Re.toast(Ne?"\u5929\u9ED1\u4E86\uFF0C\u8F66\u706F\u548C\u8DEF\u706F\u4EAE\u8D77":"\u5929\u4EAE\u4E86\uFF0C\u8F66\u706F\u7184\u706D",Ne?"moon-stars":"sun"),n.wasNight=Ne,n.phase==="ride"&&(St.held("up")&&(n.targetKmh=Math.min(la*3.6,n.targetKmh+9*B)),St.held("down")&&(n.targetKmh=Math.max(0,n.targetKmh-9*B))),m.target=n.phase==="ride"?n.targetKmh/3.6:0,m.slope=o.slope(n.s),m.jump=n.jump,p.time=n.time;let Ke=dm(p,B,m);n.jump=!1;for(let ae of Ke){if(ae.type==="jump"&&(d.sfx.jump(),k("jump",()=>Re.toast("\u8DF3\u8D77\u6765\u4E86\uFF0C\u843D\u5730\u65F6\u5589\u56CA\u4F1A\u6643\u4E00\u4E0B","arrows-vertical"))),ae.type==="land"){let he=wt(ae.impact/4.4);d.sfx.land(he),l.dust(u.hero.position,he),f.shakeBy(.55*he)}ae.type==="shift"&&k("shift",()=>Re.toast(`\u6362\u5230 ${p.gear+1} \u6321\u3002\u6321\u4F4D\u8D8A\u9AD8\uFF0C\u540C\u6837\u7684\u901F\u5EA6\u8E0F\u9891\u8D8A\u4F4E`,"bicycle"))}n.s=(n.s+p.v*B)%o.length;let C=o.curvatureAt(n.s);N0(u.hero,o,n.s,{airY:p.airY,speed:p.v,curvature:C,jumpPitch:p.air?ct(-p.airVy*.045,-.2,.16):0},x),u.hero.updateMatrixWorld(!0),Vn(B);let Q=0;n.squawkT>=0&&(Q=Math.pow(Math.sin(Math.PI*wt(n.squawkT/.75)),.6),n.squawkT+=B,n.squawkT>.75&&(n.squawkT=-1)),u.update(p,B,{curvature:C,lampLevel:g.lamps,ringBell:n.ringBell,look:_,mouth:Q}),n.ringBell=!1,l.update(B,{time:n.time,heroPos:u.hero.position,camera:r.camera,lampLevel:g.lamps}),fe&&(le+=B,le>.12&&(le=0,fe=!1,Ni(Ae.sculpt))),p.v*3.6>40&&k("fast",()=>Re.toast("\u65F6\u901F\u8D85\u8FC7 40 \u516C\u91CC\uFF0C\u56F4\u5DFE\u5FEB\u98DE\u8D77\u6765\u4E86","bird")),p.stats.coastTime>5&&k("coast",()=>Re.toast("\u505C\u6B62\u8E29\u8E0F\uFF0C\u6ED1\u884C\u4E2D\u3002\u98DE\u8F6E\u5728\u54D2\u54D2\u5730\u54CD","arrows-vertical")),p.distance>o.length&&k("lap",()=>Re.toast(`\u7ED5\u5C9B\u4E00\u5708\uFF0C\u7D2F\u8BA1 ${(p.distance/1e3).toFixed(2)} \u516C\u91CC`,"map-pin"))}function tr(B){if(n.debugCam){let[Ne,Ke,C,Q]=n.debugCam,ae=Ne*Math.PI/180,he=Ke*Math.PI/180,re=u.hero,Le=new D(Math.sin(ae)*Math.cos(he)*C,Math.sin(he)*C,-Math.cos(ae)*Math.cos(he)*C).applyQuaternion(re.quaternion);r.camera.position.copy(re.position).add(Le),r.camera.lookAt(re.position.clone().add(new D(0,Q,0))),r.camera.fov=C>14?40:36,r.camera.updateProjectionMatrix(),r.syncCameraUniforms();return}u.pelican.headNode.getWorldPosition(E),u.pelican.headNode.getWorldQuaternion(A),f.update(B,{hero:u.hero.position,yaw:x.yaw??0,speed:p.v,s:n.s,headPos:E,headQuat:A,placeAt:(Ne,Ke)=>l.spot(Ne,Ke,{}),offset:n.phase==="intro"&&r.camera.aspect>1.25?1.25:0})}let _n=[];function Ni(B){u.setSculpt(B),V.adopt(u.hero),n.povOn=!1,_n=[]}function At(B){if(B!==n.povOn)if(n.povOn=B,B){let Ne=new Set(["skull","eyeL","eyeR","helmet","helmetTrim","crest"]);u.pelican.headNode.traverse(C=>{Ne.has(C.name)&&(_n.push([C,C.visible]),C.visible=!1)});let Ke=u.pelican.neckMesh.children.find(C=>C.userData.isOutline);Ke&&(_n.push([Ke,Ke.visible]),Ke.visible=!1)}else{for(let[Ne,Ke]of _n)Ne.visible=V.real&&Ne.userData.isOutline?!1:Ke;_n=[]}}function qt(){h.lampAnchor.getWorldPosition(v),u.hero.getWorldQuaternion(S);let B=h.lamp>.02;s.uLightsPos.value[0].copy(v),s.uLightsDir.value[0].set(0,-.07,1).applyQuaternion(S).normalize(),s.uLightsColor.value[0].setRGB(1,.93,.72),s.uLightsParam.value[0].set(.95,.86,.9*h.lamp,B?26:0),$.on=B,$.pos.copy(v),$.dir.copy(s.uLightsDir.value[0]),$.level=h.lamp,R.uniforms.uOpacity.value=h.lamp*.34,U.visible=B}function Ln(){if(!n.inspector)return;let B=u.pelican.debug,Ne=u.anchors;for(let[Ke,C]of[[0,"L"],[1,"R"]]){Z(ye.leg[Ke][0],B["hip"+C],B["knee"+C],.012),Z(ye.leg[Ke][1],B["knee"+C],B["ankle"+C],.012),ee(Ee.hip[Ke],B["hip"+C],.036),ee(Ee.knee[Ke],B["knee"+C],.028),ee(Ee.ankle[Ke],B["ankle"+C],.026);let Q=Ke===0?Ne.gripL:Ne.gripR;Z(ye.arm[Ke][0],B["sh"+C],B["el"+C],.01),Z(ye.arm[Ke][1],B["el"+C],Q,.01),ee(Ee.sh[Ke],B["sh"+C],.036),ee(Ee.el[Ke],B["el"+C],.026),ee(Ee.wrist[Ke],Q,.024),ee(Te[Ke],Ke===0?Ne.pedalL:Ne.pedalR,.022)}Z(ye.spine,B.neckPts[0],u.pelican.headNode.position,.009),ee(Ee.head,u.pelican.headNode.position,.036)}function Gn(B){n.hudT+=B,!(n.hudT<1/15)&&(Re.update({speedKmh:p.v*3.6,cadence:Math.abs(p.crankVel)*60/He,gear:p.gear,mode:p.mode,distanceKm:p.distance/1e3,clock:um(n.hour),todLabel:aa(n.hour).label,todIcon:pm[aa(n.hour).id],camLabel:f.mode.label,camHint:f.mode.hint,styleLabel:rf[n.style],muted:n.muted,music:n.music,paused:n.paused},n.hudT),n.hudT=0)}f.hooks.onCut=()=>{n.fadeT=0};let Fn=0;function Rt(B){let Ne=!n.paused&&!n.hidden;r.renderer.shadowMap.needsUpdate=!0,Ne&&Tn(B),(Ne||f.mode.id!=="director")&&tr(B),At(!n.debugCam&&f.mode.id==="pov"),qt(),Ln(),l.sky.update(n.time,r.camera),M.hour=n.hour,M.cadence=Math.abs(p.crankVel)*60/He,M.wind=wt(p.v/12),d.update(Ne?p:b,B,M),Gn(B),n.fadeT>=0&&(n.fadeT+=B,Re.fade(n.fadeT>.38?0:n.fadeT<.08?n.fadeT/.08:1-(n.fadeT-.08)/.3),n.fadeT>.38&&(n.fadeT=-1)),V.real?(v.copy(u.hero.position),v.y+=1.15,v.applyMatrix4(r.camera.matrixWorldInverse),n.focus=pn(n.focus,n.debugCam?Math.max(1.2,-v.z):f.mode.id==="pov"?9:Math.max(1.2,-v.z),7,B||1/60),X.dof.uniforms.uFocus.value=n.focus,V.update({lampLevel:g.lamps,head:$,world:l,quality:n.qLevel}),l.renderReflection(r.scene,r.camera),r.render(()=>X.render(B))):r.render(),Fn++}let sn=performance.now();function bi(B){requestAnimationFrame(bi);let Ne=Math.min(.05,Math.max(0,(B-sn)/1e3));sn=B,n.freeze||Rt(Ne)}document.addEventListener("visibilitychange",()=>{n.hidden=document.hidden,sn=performance.now()}),window.addEventListener("resize",ve),lf.addEventListener?.("change",B=>{B.matches&&(n.reduced=!0,Re.setReduced(!0))}),Fi.get("quality")!==null&&Y(ct(Math.round(Ss("quality",2)),0,2)),ve(),s.uOutlinePx.value=Ae.outline,de(),z(),p.gear=1,Ss("v",0)>0&&(p.v=Ss("v",0),n.targetKmh=Ss("target",p.v*3.6),Re.setTargetSlider(n.targetKmh)),n.s=y,n.phase==="intro"&&!n.reduced&&f.setMode(3),Fi.get("cam")&&f.setMode(Math.max(0,Di.findIndex(B=>B.id===Fi.get("cam")))),Re.setIntro(n.phase==="intro"),ne(n.hour);for(let B=0;B<90;B++)Tn(1/60);n.time=0,p.time=0,Rt(0),window.__sceneReady=!0,n.freeze||requestAnimationFrame(bi);let Ei={behind:[0,14,6.6,.9],sideSea:[92,6,6.2,.9],sideLand:[-92,6,6.2,.9],front34:[38,12,6,.9],ahead:[178,16,7.5,1],low:[24,3,4.6,1],high:[-60,42,22,0],far34:[-50,20,15,.8],close34:[60,8,2.6,1.5]},Ui={settle:(B=1,Ne=1/60)=>{for(let Ke=0;Ke<B;Ke++)Rt(Ne)},step:(B=1/60,Ne=1)=>{for(let Ke=0;Ke<Ne;Ke++)Rt(B)},stats:()=>({...r.stats,buildMs:Math.round(c),world:l.stats(),qLevel:n.qLevel,frameCostMs:n.frameCost?+n.frameCost.toFixed(2):null,dpr:r.pixelRatio,errlog:e,audio:d.getState()}),calibrate:()=>+I().toFixed(2),measureAt:B=>+me(B).toFixed(2),state:()=>({phase:n.phase,paused:n.paused,v:p.v,kmh:p.v*3.6,cadence:Math.abs(p.crankVel)*60/He,gear:p.gear,mode:p.mode,crank:p.crank,s:n.s,hour:n.hour,cam:f.mode.id,style:n.style,air:p.air,distance:p.distance,time:n.time}),setView:B=>{n.debugCam=Ei[B]||null,!n.debugCam&&Di.some(Ne=>Ne.id===B)&&f.setMode(B),Rt(0)},cam:B=>{n.debugCam=null,f.setMode(B),Rt(0)},pose:(B={})=>{B.v!==void 0&&(p.v=B.v,n.targetKmh=B.v*3.6),B.s!==void 0&&(n.s=B.s),B.crank!==void 0&&(p.crank=B.crank),Ui.settle(2)},hour:B=>{n.hourTarget=null,ne(B),Rt(0)},style:B=>{n.style=ct(Math.round(B),0,3),z(),Rt(0)},start:(B=!1)=>xt(B),pause:(B=!0)=>{n.paused=B,n.userPaused=B,Rt(0)},bell:()=>De(),jump:()=>{n.jump=!0},squawk:()=>ke(!1),squawkLook:()=>ke(!0),fish:()=>Pe(),gear:B=>{m.gear=B},target:B=>{n.targetKmh=B,Re.setTargetSlider(B)},sculpt:B=>{Object.assign(Ae.sculpt,B),Ni(Ae.sculpt),Rt(0)},inspect:(B=!0)=>{n.inspector=B,K.visible=B,Rt(0)},fps:(B=120)=>{let Ne=performance.now();for(let Ke=0;Ke<B;Ke++)Rt(1/60);return Math.round(B/((performance.now()-Ne)/1e3))},hero:()=>u.hero,rider:u,world:l,U:s,stage:r,kit:V,postfx:X,settings:Ae,frames:()=>Fn};window.__ride=Ui,window.__viewer={views:[...Object.keys(Ei),...Di.map(B=>B.id)],setView:B=>Ui.setView(B)}}try{CM()}catch(i){console.error(i);let e=document.getElementById("error");e&&(e.textContent=`\u9875\u9762\u542F\u52A8\u5931\u8D25\uFF1A${i.message}\u3002\u8BF7\u7528\u65B0\u7248 Edge \u6216 Chrome \u6253\u5F00\uFF1B\u5982\u679C\u662F\u4ECE\u672C\u5730\u6587\u4EF6\u6253\u5F00\uFF0C\u786E\u8BA4 app.js \u4E0E index.html \u5728\u540C\u4E00\u4E2A\u6587\u4EF6\u5939\u91CC\u3002`,e.hidden=!1)}})();
//# sourceMappingURL=app.js.map
