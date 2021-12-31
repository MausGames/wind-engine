///////////////////////////////////////////////////////////
//*-----------------------------------------------------*//
//| Part of the Wind Engine (https://www.maus-games.at) |//
//*-----------------------------------------------------*//
//| Copyright (c) 2014 Martin Mauersics                 |//
//| Released under the zlib License                     |//
//*-----------------------------------------------------*//
///////////////////////////////////////////////////////////
"use strict";
class windFrameBuffer {


// ****************************************************************
constructor()
{
    // create properties
    this.m_pIdentifier = null;
    this.m_pTexture    = new windTexture();

    this.iWidth        = 0;
    this.iHeight       = 0;

    // create static properties
    windFrameBuffer.s_pCurFrameBuffer = null;
}


// ****************************************************************
Destructor()
{
    // reset current framebuffer
    if(windFrameBuffer.s_pCurFrameBuffer === this)
        windFrameBuffer.Disable();

    // delete texture and framebuffer
    this.m_pTexture.Destructor();
    GL.deleteFramebuffer(this.m_pIdentifier);
}


// ****************************************************************
Create(iWidth, iHeight, bKeepBound = false)
{
    // create framebuffer
    this.m_pIdentifier = GL.createFramebuffer();
    GL.bindFramebuffer(GL.FRAMEBUFFER, this.m_pIdentifier);

    // create texture
    this.iWidth  = iWidth;
    this.iHeight = iHeight;
    this.m_pTexture.Create(iWidth, iHeight, false);

    // attach texture as color buffer
    this.m_pTexture.Enable(0);
    GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, this.m_pTexture.m_pIdentifier, 0);

    // check for valid framebuffer
    const iError = GL.checkFramebufferStatus(GL.FRAMEBUFFER);
    if(iError !== GL.FRAMEBUFFER_COMPLETE)
        alert("Frame Buffer Error: " + iError);

    // set or reset current framebuffer
    if(bKeepBound) windFrameBuffer.s_pCurFrameBuffer = this;
    else GL.bindFramebuffer(GL.FRAMEBUFFER, windFrameBuffer.s_pCurFrameBuffer.m_pIdentifier);

    return this;
}


// ****************************************************************
Enable()
{
    if(windFrameBuffer.s_pCurFrameBuffer !== this)
    {
        // enable framebuffer
        windFrameBuffer.s_pCurFrameBuffer = this;
        GL.bindFramebuffer(GL.FRAMEBUFFER, this.m_pIdentifier);

        // set viewport
        GL.viewport(0, 0, this.iWidth, this.iHeight);
    }
}


// ****************************************************************
static Disable()
{
    if(windFrameBuffer.s_iCurFrameBuffer !== null)
    {
        // disable framebuffer
        windFrameBuffer.s_iCurFrameBuffer = null;
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);

        // reset viewport
        GL.viewport(0, 0, WIND.g_pCanvas.width, WIND.g_pCanvas.height);
    }
}


} // class windFrameBuffer