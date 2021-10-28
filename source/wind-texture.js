///////////////////////////////////////////////////////////
//*-----------------------------------------------------*//
//| Part of the Wind Engine (https://www.maus-games.at) |//
//*-----------------------------------------------------*//
//| Released under the zlib License                     |//
//| More information available in the readme file       |//
//*-----------------------------------------------------*//
///////////////////////////////////////////////////////////
"use strict";
class windTexture {

// TODO 3: WEBGL_compressed_texture_s3tc
// TODO 3: 1, 2, 3 channel textures (+EXT_texture_compression_rgtc)


// ****************************************************************
constructor()
{
    // create properties
    this.m_pIdentifier = null;

    this.m_iWidth      = 0;
    this.m_iHeight     = 0;
    this.m_iLevels     = 0;

    // create static properties
    windTexture.s_iActiveUnit = 0;
    windTexture.s_apBound     = new Array();
}


// ****************************************************************
Destructor()
{
    if(!this.m_pIdentifier) return;

    // reset current texture
    for(let i = 0, ie = windTexture.s_apBound.length; i < ie; ++i)
        if(windTexture.s_apBound[i] === this) windTexture.Disable(i);

    // delete texture
    GL.deleteTexture(this.m_pIdentifier);
}


// ****************************************************************
Load(sPath)
{
    // create image object
    const pImage = new Image();

    // load texture file asynchronously
    const pThis = this;
    pImage.onload = function()
    {
        pThis.Create(pImage.width, pImage.height, true);
        pThis.Modify(pImage);
    };

    // start loading
    pImage.src = sPath;

    return this;
}


// ****************************************************************
Create(iWidth, iHeight, bMipMap)
{
    // 
    this.m_iWidth  = iWidth;
    this.m_iHeight = iHeight;
    this.m_iLevels = bMipMap ? (Math.log2(Math.max(iWidth, iHeight)) + 1) : 1;

    // create texture
    this.m_pIdentifier = GL.createTexture();

    // 
    GL.bindTexture(GL.TEXTURE_2D, this.m_pIdentifier);
    windTexture.s_apBound[windTexture.s_iActiveUnit] = this;

    // load texture data
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, bMipMap ? GL.LINEAR_MIPMAP_LINEAR : GL.LINEAR);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S,     GL.REPEAT);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T,     GL.REPEAT);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_BASE_LEVEL, 0);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAX_LEVEL,  this.m_iLevels - 1);
    if(GL.ExtAnisotropic) GL.texParameterf(GL.TEXTURE_2D, GL.ExtAnisotropic.TEXTURE_MAX_ANISOTROPY_EXT, GL.ExtAnisotropic.fMaxAnisotropy);

    // 
    if(GL.iVersion >= 2) GL.texStorage2D(GL.TEXTURE_2D, this.m_iLevels, GL.RGBA8, this.m_iWidth, this.m_iHeight);
                    else GL.texImage2D  (GL.TEXTURE_2D, 0, GL.RGBA, this.m_iWidth, this.m_iHeight, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);

    return this;
}


// ****************************************************************
Modify(pData)
{
    // 
    this.Enable(windTexture.s_iActiveUnit);

    // 
    GL.texSubImage2D(GL.TEXTURE_2D, 0, 0, 0, GL.RGBA, GL.UNSIGNED_BYTE, pData);
    if(this.m_iLevels > 1) GL.generateMipmap(GL.TEXTURE_2D);
}


// ****************************************************************
Enable(iUnit)
{
    // 
    windTexture.__BindTexture(iUnit, this);
}


// ****************************************************************
static Disable(iUnit)
{
    // 
    windTexture.__BindTexture(iUnit, null);
}


// ****************************************************************
static __BindTexture(iUnit, pTexture)
{
    // check texture binding
    if(windTexture.s_apBound[iUnit] === pTexture) return;
    windTexture.s_apBound[iUnit] = pTexture;

    if(windTexture.s_iActiveUnit !== iUnit)
    {
        // activate texture unit
        windTexture.s_iActiveUnit = iUnit;
        GL.activeTexture(GL.TEXTURE0 + iUnit);
    }

    // bind texture to current unit
    GL.bindTexture(GL.TEXTURE_2D, pTexture ? pTexture.m_pIdentifier : null);
}


} // class windTexture