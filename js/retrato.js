/* Retrato: dentro da moldura, a peça se forma do preto ao cinza.
   A tinta entra primeiro pelas sombras mais escuras e termina nas luzes, como o realismo é construído na pele. */
(function () {
  var VS = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
  var FS = [
    'precision mediump float;varying vec2 v;uniform sampler2D A,B;uniform float p,vazio;',
    'float h(vec2 x){return fract(sin(dot(x,vec2(127.1,311.7)))*43758.5453);}',
    'float vn(vec2 x){vec2 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+1.),f.x),f.y);}',
    'void main(){',
    ' vec3 b=texture2D(B,v).rgb;',
    ' vec3 base=vec3(.04,.037,.034)+b*.2;',
    ' vec3 a=vazio>.5?base:mix(texture2D(A,v).rgb,base,smoothstep(0.,.3,p));',
    ' float ink=1.-dot(b,vec3(.299,.587,.114));',
    ' float n=vn(v*vec2(7.,9.))*.55+vn(v*vec2(38.,50.))*.3+h(floor(v*vec2(420.,560.)))*.15;',
    ' float q=clamp((p-.14)/.86,0.,1.);',
    ' float th=1.2-q*1.6;',
    ' float m=smoothstep(th,th+.3,ink+(n-.5)*.22);',
    ' m=max(m,smoothstep(.86,1.,q));',
    ' vec3 c=mix(a,b,m);',
    ' gl_FragColor=vec4(mix(c,vec3(dot(c,vec3(.299,.587,.114))),.22),1.);',
    '}'].join('\n');

  window.RETRATO = { ciclo: 5, revela: 1.6 };

  window.Retrato = function (cv, imgs, op) {
    op = op || {};
    var gl = cv.getContext('webgl', { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: !!op.gravar });
    if (!gl) return null;
    function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(o); return o; }
    var pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    var bf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var lp = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    var tex = imgs.map(function (im) {
      var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    });
    var uA = gl.getUniformLocation(pr, 'A'), uB = gl.getUniformLocation(pr, 'B'), uP = gl.getUniformLocation(pr, 'p'), uV = gl.getUniformLocation(pr, 'vazio');
    gl.uniform1i(uA, 0); gl.uniform1i(uB, 1);
    var N = tex.length, desl = op.desloc || 0, atraso = op.atraso || 0, ult = '';
    function ajusta(dpr) {
      var w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
      if (op.fixo) { w = op.fixo[0]; h = op.fixo[1]; }
      if (w && h && (cv.width !== w || cv.height !== h)) { cv.width = w; cv.height = h; ult = ''; }
      gl.viewport(0, 0, cv.width, cv.height);
    }
    function ease(x) { return x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
    return {
      desenha: function (t, dpr) {
        ajusta(Math.min(dpr || 1, 2));
        var C = RETRATO.ciclo, tt = t - atraso, k, p, vazio = 0;
        if (tt < 0) { k = 0; p = 0; vazio = 1; }
        else { k = Math.floor(tt / C); p = ease(Math.min(1, (tt - k * C) / RETRATO.revela)); vazio = k === 0 && !op.semVazio ? 1 : 0; }
        var ib = (k + desl) % N, ia = (k - 1 + desl + N) % N, chave = ib + '|' + ia + '|' + vazio + '|' + p.toFixed(4) + '|' + cv.width;
        if (chave === ult) return; ult = chave;
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex[ia]);
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tex[ib]);
        gl.uniform1f(uP, p); gl.uniform1f(uV, vazio);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    };
  };
})();
