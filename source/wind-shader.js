///////////////////////////////////////////////////////////
//*-----------------------------------------------------*//
//| Part of the Wind Engine (https://www.maus-games.at) |//
//*-----------------------------------------------------*//
//| Copyright (c) 2014 Martin Mauersics                 |//
//| Released under the zlib License                     |//
//*-----------------------------------------------------*//
///////////////////////////////////////////////////////////
"use strict";
class windShader {

// TODO 3: allow loading from file (split up, .vert, .frag, etc.)


// ****************************************************************
constructor()
{
    // create properties
    this.m_pVertexShader   = null;
    this.m_pFragmentShader = null;
    this.m_pProgram        = null;

    this.m_apUniform       = new Map();
    this.m_avCache         = new Map();

    // create static properties
    windShader.s_pCurProgram = null;

// ****************************************************************
windShader.GLOBAL_VERTEX =
"attribute vec3 a_v3Position;"      + "\n" +
"attribute vec2 a_v2Texture;"       + "\n" +
"attribute vec3 a_v3Normal;"        + "\n" +
"uniform   mat4 u_m4ModelView;"     + "\n" +
"uniform   mat4 u_m4ModelViewProj;" + "\n" +
"uniform   vec2 u_v2TexSize;"       + "\n" +
"uniform   vec2 u_v2TexOffset;"     + "\n";


// ****************************************************************
windShader.GLOBAL_FRAGMENT =
"precision mediump float;"                                                             + "\n" +
""                                                                                     + "\n" +
"uniform vec4 u_v4Color;"                                                              + "\n" +
""                                                                                     + "\n" +
"#if (__VERSION__ >= 300)"                                                             + "\n" +
"    #define coreIntMod(a,b) ((a) % (b))"                                              + "\n" +
"#else"                                                                                + "\n" +
"    int   coreIntMod(const in int   a, const in int b) {return (a - (b * (a / b)));}" + "\n" +
"    ivec2 coreIntMod(const in ivec2 a, const in int b) {return (a - (b * (a / b)));}" + "\n" +
"    ivec3 coreIntMod(const in ivec3 a, const in int b) {return (a - (b * (a / b)));}" + "\n" +
"    ivec4 coreIntMod(const in ivec4 a, const in int b) {return (a - (b * (a / b)));}" + "\n" +
"#endif"                                                                               + "\n" +
""                                                                                     + "\n" +
"float coreDither(const in ivec2 i2PixelCoord)"                                        + "\n" +
"{"                                                                                    + "\n" +
"    mat4 c_m4Matrix = mat4( 0.0,  8.0,  2.0, 10.0,"                                   + "\n" +
"                           12.0,  4.0, 14.0,  6.0,"                                   + "\n" +
"                            3.0, 11.0,  1.0,  9.0,"                                   + "\n" +
"                           15.0,  7.0, 13.0,  5.0) / 15.0 - 0.5;"                     + "\n" +
""                                                                                     + "\n" +
"    ivec2 i2Index = coreIntMod(i2PixelCoord, 4);"                                     + "\n" +
"    for(int i = 0; i < 4; i++)"                                                       + "\n" +
"    {"                                                                                + "\n" +
"        for(int j = 0; j < 4; j++)"                                                   + "\n" +
"        {"                                                                            + "\n" +
"            if((i == i2Index.y) && (j == i2Index.x)) return c_m4Matrix[i][j];"        + "\n" +
"        }"                                                                            + "\n" +
"    }"                                                                                + "\n" +
"}"                                                                                    + "\n" +
"float coreDither() {return coreDither(ivec2(gl_FragCoord.xy));}"                      + "\n";
}


// ****************************************************************
Destructor()
{
    if(!this.m_pProgram) return;

    // reset current shader
    if(windShader.s_pCurProgram === this)
        windShader.Disable();

    // detach and delete shaders
    GL.detachShader(this.m_pProgram, this.m_pVertexShader);
    GL.detachShader(this.m_pProgram, this.m_pFragmentShader);
    GL.deleteShader(this.m_pVertexShader);
    GL.deleteShader(this.m_pFragmentShader);

    // delete shader-program
    GL.deleteProgram(this.m_pProgram);
}


// ****************************************************************
Create(sVertexShader, sFragmentShader)
{
    // create vertex shader
    this.m_pVertexShader = GL.createShader(GL.VERTEX_SHADER);
    GL.shaderSource(this.m_pVertexShader, windShader.GLOBAL_VERTEX + sVertexShader);
    GL.compileShader(this.m_pVertexShader);

    // create fragment shader
    this.m_pFragmentShader = GL.createShader(GL.FRAGMENT_SHADER);
    GL.shaderSource(this.m_pFragmentShader, windShader.GLOBAL_FRAGMENT + sFragmentShader);
    GL.compileShader(this.m_pFragmentShader);

    // attach shaders to program object
    this.m_pProgram = GL.createProgram();
    GL.attachShader(this.m_pProgram, this.m_pVertexShader);
    GL.attachShader(this.m_pProgram, this.m_pFragmentShader);

    // bind default attributes
    GL.bindAttribLocation(this.m_pProgram, 0, "a_v3Position");
    GL.bindAttribLocation(this.m_pProgram, 1, "a_v2Texture");
    GL.bindAttribLocation(this.m_pProgram, 2, "a_v3Normal");

    // link program
    GL.linkProgram(this.m_pProgram);

    // check for errors
    if(!GL.getShaderParameter(this.m_pVertexShader, GL.COMPILE_STATUS))
        alert("Vertex Shader Error: " + GL.getShaderInfoLog(this.m_pVertexShader));

    if(!GL.getShaderParameter(this.m_pFragmentShader, GL.COMPILE_STATUS))
        alert("Fragment Shader Error: " + GL.getShaderInfoLog(this.m_pFragmentShader));

    if(!GL.getProgramParameter(this.m_pProgram, GL.LINK_STATUS))
        alert("Program Error: " + GL.getProgramInfoLog(this.m_pProgram));

    return this;
}


// ****************************************************************
Enable()
{
    if(windShader.s_pCurProgram !== this)
    {
        // enable program
        windShader.s_pCurProgram = this;
        GL.useProgram(this.m_pProgram);
    }
}


// ****************************************************************
static Disable()
{
    if(windShader.s_pCurProgram !== null)
    {
        // disable program
        windShader.s_pCurProgram = null;
        GL.useProgram(null);
    }
}


// ****************************************************************
SendUniformInt(sName, iValue)
{
    // retrieve uniform location
    const pLocation = this.__RetrieveUniform(sName);
    if((pLocation !== null) && this.__CheckCache(sName, iValue, 0.0, 0.0, 0.0))
    {
        // send new value
        GL.uniform1i(pLocation, iValue);
    }
}


// ****************************************************************
SendUniformFloat(sName, fValue)
{
    // retrieve uniform location
    const pLocation = this.__RetrieveUniform(sName);
    if((pLocation !== null) && this.__CheckCache(sName, fValue, 0.0, 0.0, 0.0))
    {
        // send new value
        GL.uniform1f(pLocation, fValue);
    }
}


// ****************************************************************
SendUniformVec2(sName, vValue)
{
    // retrieve uniform location
    const pLocation = this.__RetrieveUniform(sName);
    if((pLocation !== null) && this.__CheckCache(sName, vValue[0], vValue[1], 0.0, 0.0))
    {
        // send new value
        GL.uniform2fv(pLocation, vValue);
    }
}


// ****************************************************************
SendUniformVec3(sName, vValue)
{
    // retrieve uniform location
    const pLocation = this.__RetrieveUniform(sName);
    if((pLocation !== null) && this.__CheckCache(sName, vValue[0], vValue[1], vValue[2], 0.0))
    {
        // send new value
        GL.uniform3fv(pLocation, vValue);
    }
}


// ****************************************************************
SendUniformVec4(sName, vValue)
{
    // retrieve uniform location
    const pLocation = this.__RetrieveUniform(sName);
    if((pLocation !== null) && this.__CheckCache(sName, vValue[0], vValue[1], vValue[2], vValue[3]))
    {
        // send new value
        GL.uniform4fv(pLocation, vValue);
    }
}


// ****************************************************************
SendUniformMat2(sName, mValue, bTranspose)
{
    // retrieve uniform location
    const pLocation = this.__RetrieveUniform(sName);
    if((pLocation !== null) && this.__CheckCache(sName, mValue[0], mValue[1], mValue[2], mValue[3]))
    {
        // send new value
        GL.uniformMatrix2fv(pLocation, bTranspose, mValue);
    }
}


// ****************************************************************
SendUniformMat3(sName, mValue, bTranspose)
{
    // retrieve uniform location
    const pLocation = this.__RetrieveUniform(sName);
    if(pLocation !== null)
    {
        // send new value
        GL.uniformMatrix3fv(pLocation, bTranspose, mValue);
    }
}


// ****************************************************************
SendUniformMat4(sName, mValue, bTranspose)
{
    // retrieve uniform location
    const pLocation = this.__RetrieveUniform(sName);
    if(pLocation !== null)
    {
        // send new value
        GL.uniformMatrix4fv(pLocation, bTranspose, mValue);
    }
}


// ****************************************************************
__RetrieveUniform(sName)
{
    // 
    let pLocation = this.m_apUniform.get(sName);
    if(pLocation === undefined)
    {
        // 
        pLocation = GL.getUniformLocation(this.m_pProgram, sName);
        this.m_apUniform.set(sName, pLocation);
    }

    return pLocation;
}


// ****************************************************************
__CheckCache(sName, a, b, c, d)
{
    // 
    const vCache = this.m_avCache.get(sName);
    if(vCache === undefined)
    {
        this.m_avCache.set(sName, vec4.fromValues(a, b, c, d));
        return true;
    }

    // 
    if((vCache[0] !== a) || (vCache[1] !== b) || (vCache[2] !== c) || (vCache[3] !== d))
    {
        vec4.set(vCache, a, b, c, d);
        return true;
    }

    return false;
}


} // class windShader