///////////////////////////////////////////////////////////
//*-----------------------------------------------------*//
//| Part of the Wind Engine (https://www.maus-games.at) |//
//*-----------------------------------------------------*//
//| Copyright (c) 2014 Martin Mauersics                 |//
//| Released under the zlib License                     |//
//*-----------------------------------------------------*//
///////////////////////////////////////////////////////////
"use strict";
class windObject {


// ****************************************************************
constructor()
{
    // create properties
    this.m_vPosition  = vec3.fromValues(0.0, 0.0, 0.0);
    this.m_vSize      = vec3.fromValues(1.0, 1.0, 1.0);
    this.m_vColor     = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
    this.m_vTexSize   = vec2.fromValues(1.0, 1.0);
    this.m_vTexOffset = vec2.fromValues(0.0, 0.0);

    this.m_mTransform = mat4.create();

    this.m_pModel     = null;
    this.m_pShader    = null;
    this.m_apTexture  = new Array();
}


// ****************************************************************
Render()
{
    if(!this.m_pModel)  return;
    if(!this.m_pShader) return;

    // enable the shader-program
    this.m_pShader.Enable();

    // update all object uniforms
    this.m_pShader.SendUniformMat4("u_m4ModelView",     mat4.mul(WIND.M, WIND.g_mCamera,     this.m_mTransform), false);
    this.m_pShader.SendUniformMat4("u_m4ModelViewProj", mat4.mul(WIND.M, WIND.g_mProjection, WIND.M),            false);
    this.m_pShader.SendUniformVec4("u_v4Color",         this.m_vColor);
    this.m_pShader.SendUniformVec2("u_v2TexSize",       this.m_vTexSize);
    this.m_pShader.SendUniformVec2("u_v2TexOffset",     this.m_vTexOffset);

    // enable all active textures
    for(let i = 0, ie = this.m_apTexture.length; i < ie; ++i)
        if(this.m_apTexture[i]) this.m_apTexture[i].Enable(i);

    // draw the model
    this.m_pModel.Draw();
}


// ****************************************************************
Move()
{
    // update transformation
    mat4.identity (this.m_mTransform);
    mat4.translate(this.m_mTransform, this.m_mTransform, this.m_vPosition);
    mat4.scale    (this.m_mTransform, this.m_mTransform, this.m_vSize);
}


} // class windObject