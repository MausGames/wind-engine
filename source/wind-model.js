///////////////////////////////////////////////////////////
//*-----------------------------------------------------*//
//| Part of the Wind Engine (https://www.maus-games.at) |//
//*-----------------------------------------------------*//
//| Copyright (c) 2014 Martin Mauersics                 |//
//| Released under the zlib License                     |//
//*-----------------------------------------------------*//
///////////////////////////////////////////////////////////
"use strict";
class windModel {

// TODO 4: split enable disable ?
// TODO 3: half float compression for pos (Float16Array ?), 1010102 compression for normal (extensions ? WGL2 ?)
// TODO 3: allow loading from file (which format ?)


// ****************************************************************
constructor()
{
    // create properties
    this.m_pVertexArray  = null;

    this.m_pVertexBuffer = null;
    this.m_pIndexBuffer  = null;

    this.m_iNumVertices  = 0;
    this.m_iNumIndices   = 0;

    // create static properties
    windModel.s_pCurModel = null;
}


// ****************************************************************
Destructor()
{
    if(!this.m_pVertexBuffer) return;

    // reset current model
    if(windModel.s_pCurModel === this)
        windModel.s_pCurModel = null;

    // delete vertex and index buffer
    GL.deleteBuffer(this.m_pVertexBuffer);
    GL.deleteBuffer(this.m_pIndexBuffer);

    // delete vertex array object
    GL.deleteVertexArray(this.m_pVertexArray);
}


// ****************************************************************
Create(afVertexData, aiIndexData)
{
    // reset current model
    if(GL.iVersion >= 2) GL.bindVertexArray(null);
    windModel.s_pCurModel = null;

    // save size values
    this.m_iNumVertices = afVertexData.length / 8;
    this.m_iNumIndices  = aiIndexData.length;

    // compress vertex data
    const pData       = new ArrayBuffer (this.m_iNumVertices * 5 * 4);
    const pViewFloat  = new Float32Array(pData);
    const pViewUint16 = new Uint16Array (pData);
    const pViewUint8  = new Uint8Array  (pData);
    for(let i = 0; i < this.m_iNumVertices; ++i)
    {
        pViewFloat [i*5  + 0]  = afVertexData[i*8 + 0];
        pViewFloat [i*5  + 1]  = afVertexData[i*8 + 1];
        pViewFloat [i*5  + 2]  = afVertexData[i*8 + 2];

        pViewUint16[i*10 + 6]  = UTILS.PackUnorm32To16(afVertexData[i*8 + 3]);
        pViewUint16[i*10 + 7]  = UTILS.PackUnorm32To16(afVertexData[i*8 + 4]);

        pViewUint8 [i*20 + 16] = UTILS.PackSnorm32To8(afVertexData[i*8 + 5]);
        pViewUint8 [i*20 + 17] = UTILS.PackSnorm32To8(afVertexData[i*8 + 6]);
        pViewUint8 [i*20 + 18] = UTILS.PackSnorm32To8(afVertexData[i*8 + 7]);
        pViewUint8 [i*20 + 19] = 0;   // # 4-byte alignment for best performance
    }

    // create vertex buffer
    this.m_pVertexBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, this.m_pVertexBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, pData, GL.STATIC_DRAW);

    // create index buffer
    this.m_pIndexBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.m_pIndexBuffer);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(aiIndexData), GL.STATIC_DRAW);

    return this;
}


// ****************************************************************
Draw()
{
    if(windModel.s_pCurModel !== this)
    {
        windModel.s_pCurModel = this;

        // bind vertex array object
        if(this.m_pVertexArray) GL.bindVertexArray(this.m_pVertexArray);
        else
        {
            if(GL.iVersion >= 2)
            {
                // create vertex array object
                this.m_pVertexArray = GL.createVertexArray();
                GL.bindVertexArray(this.m_pVertexArray);
            }

            // enable vertex and index buffer
            GL.bindBuffer(GL.ARRAY_BUFFER,         this.m_pVertexBuffer);
            GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.m_pIndexBuffer);

            // enable vertex attribute arrays
            GL.enableVertexAttribArray(0);
            GL.enableVertexAttribArray(1);
            GL.enableVertexAttribArray(2);

            // set attributes
            GL.vertexAttribPointer(0, 3, GL.FLOAT,          false, 5*4, 0);
            GL.vertexAttribPointer(1, 2, GL.UNSIGNED_SHORT, false, 5*4, 3*4);
            GL.vertexAttribPointer(2, 4, GL.BYTE,           true,  5*4, 4*4);
        }
    }

    // draw the model
    GL.drawElements(GL.TRIANGLES, this.m_iNumIndices, GL.UNSIGNED_SHORT, 0);
}


} // class windModel