///////////////////////////////////////////////////////////
//*-----------------------------------------------------*//
//| Part of the Wind Engine (https://www.maus-games.at) |//
//*-----------------------------------------------------*//
//| Copyright (c) 2014 Martin Mauersics                 |//
//| Released under the zlib License                     |//
//*-----------------------------------------------------*//
///////////////////////////////////////////////////////////
"use strict";
class windSound {


// ****************************************************************
constructor()
{
    // create properties
    this.m_pBuffer = null;
    this.m_pGain   = null;
}


// ****************************************************************
Load(sPath)
{
    if(!WIND.s_pAudioContext) return this;

    // load sound file asynchronously
    const pRequest = new XMLHttpRequest();
    pRequest.open("GET", sPath, true);
    pRequest.responseType = "arraybuffer";

    // decode further when finished
    const pThis = this;
    pRequest.onload = function()
    {
        WIND.s_pAudioContext.decodeAudioData(pRequest.response, function(pBuffer)
        {
            // save decoded sound buffer
            pThis.m_pBuffer = pBuffer;
        });
    };

    // start loading
    pRequest.send();

    // create volume control
    this.m_pGain = WIND.s_pAudioContext.createGain();
    this.m_pGain.connect(WIND.s_pAudioContext.destination);

    return this;
}


// ****************************************************************
Play(fPitch = 1.0)
{
    if(!WIND.s_pAudioContext) return;
    if(!WIND.g_bOptionSound)  return;
    if(!this.m_pBuffer)       return;

    // create new sound source (# seems they can only be used once)
    const pSource = WIND.s_pAudioContext.createBufferSource();

    // set buffer and connect to volume control
    pSource.buffer = this.m_pBuffer;
    pSource.connect(this.m_pGain);

    // play the sound
    pSource.playbackRate.value = fPitch + (0.05 * (Math.random() - 0.5));
    pSource.start(0);
}


// ****************************************************************
SetVolume(fVolume)
{
    if(!WIND.s_pAudioContext) return;
    this.m_pGain.gain.value = fVolume;
}


} // class windSound