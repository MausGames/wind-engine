//////////////////////////////////////////////////////////////////////////////////
//*----------------------------------------------------------------------------*//
//| Wind Engine v1.0.0 (https://www.maus-games.at)                             |//
//*----------------------------------------------------------------------------*//
//| Copyright (c) 2014 Martin Mauersics                                        |//
//|                                                                            |//
//| This software is provided 'as-is', without any express or implied          |//
//| warranty. In no event will the authors be held liable for any damages      |//
//| arising from the use of this software.                                     |//
//|                                                                            |//
//| Permission is granted to anyone to use this software for any purpose,      |//
//| including commercial applications, and to alter it and redistribute it     |//
//| freely, subject to the following restrictions:                             |//
//|                                                                            |//
//| 1. The origin of this software must not be misrepresented; you must not    |//
//|    claim that you wrote the original software. If you use this software    |//
//|    in a product, an acknowledgment in the product documentation would be   |//
//|    appreciated but is not required.                                        |//
//|                                                                            |//
//| 2. Altered source versions must be plainly marked as such, and must not be |//
//|    misrepresented as being the original software.                          |//
//|                                                                            |//
//| 3. This notice may not be removed or altered from any source distribution. |//
//*----------------------------------------------------------------------------*//
//////////////////////////////////////////////////////////////////////////////////
"use strict";
const WIND = {};

// TODO 4: move more default functionality from ThrowOut to WindEngine (especially related to pause and menu handling, which is currently only partially ported to engine)
// TODO 3: ANGLE_instanced_arrays, EXT_color_buffer_float, EXT_color_buffer_half_float, EXT_frag_depth, EXT_sRGB, EXT_texture_compression_rgtc, EXT_texture_norm16
// TODO 3: KHR_parallel_shader_compile, OES_standard_derivatives, OES_texture_float, OES_texture_float_linear, OES_texture_half_float, OES_texture_half_float_linear
// TODO 3: OES_vertex_array_object, WEBGL_color_buffer_float, WEBGL_compressed_texture_s3tc, WEBGL_depth_texture, WEBGL_draw_buffers


// ****************************************************************
let GL  = null;                           // WebGL context
let TEX = null;                           // texture canvas (and 2d context)

WIND.g_pCanvas       = null;              // main canvas
WIND.g_pAudioStream  = null;              // audio stream
WIND.s_pAudioContext = null;              // audio context

WIND.g_pMenuLogo    = null;               // main logo
WIND.g_pMenuHeader  = null;               // game header
WIND.g_pMenuOption1 = null;               // menu option first
WIND.g_pMenuOption2 = null;               // menu option second
WIND.g_pMenuOption3 = null;               // menu option third
WIND.g_pMenuRight   = null;               // text bottom right
WIND.g_pMenuLeft    = null;               // text bottom left
WIND.g_pMenuVideo   = null;               // text top right
WIND.g_pMenuAudio   = null;               // text top left
WIND.g_pMenuStart   = null;               // button start
WIND.g_pMenuResume  = null;               // button resume
WIND.g_pMenuRestart = null;               // button restart
WIND.g_pMenuFull    = null;               // button fullscreen
WIND.g_pMenuQuality = null;               // button quality
WIND.g_pMenuMusic   = null;               // button music
WIND.g_pMenuSound   = null;               // button sound

WIND.g_mProjection = mat4.create();       // global projection matrix
WIND.g_mCamera     = mat4.create();       // global camera matrix

WIND.g_vCamPosition    = vec3.create();   // camera position
WIND.g_vCamTarget      = vec3.create();   // camera target
WIND.g_vCamOrientation = vec3.create();   // camera orientation

WIND.g_vMousePos   = vec2.create();       // current position of the cursor [-V/2, V/2]
WIND.g_fMouseRect  = vec2.create();       // transformed canvas-rect values required for mouse position calculations
WIND.g_fMouseRange = 0.0;                 // mouse position range factor

WIND.g_fSaveTime  = 0.0;                  // saved time value to calculate last frame time
WIND.g_fTotalTime = 0.0;                  // total time since start of the application
WIND.g_fTime      = 0.0;                  // last frame time

WIND.g_bStarted = false;                  // 
WIND.g_bEnded   = false;                  // 
WIND.g_bPaused  = false;                  // 

WIND.g_bOptionQuality = true;             // current quality level
WIND.g_bOptionMusic   = true;             // current music status
WIND.g_bOptionSound   = true;             // current sound status

WIND.g_iRequestID = 0;                    // ID from requestAnimationFrame()

WIND.M = mat4.create();                   // pre-allocated general purpose matrix
WIND.V = vec4.create();                   // pre-allocated general purpose vector
WIND.Q = quat.create();                   // pre-allocated general purpose quaternion


// ****************************************************************
window.addEventListener("load", function()
{
    // retrieve main canvas
    WIND.g_pCanvas = document.getElementById("canvas");

    // define WebGL context properties
    const abProperty = {alpha : APP.SETTINGS.Alpha, depth : APP.SETTINGS.Depth, stencil : APP.SETTINGS.Stencil,
                        antialias : true, premultipliedAlpha : true, preserveDrawingBuffer : false, desynchronized : false,
                        powerPreference : "default", failIfMajorPerformanceCaveat : false};

    // retrieve WebGL context
    GL = WIND.g_pCanvas.getContext("webgl2", abProperty);
    if(!GL)
    {
        GL = WIND.g_pCanvas.getContext("webgl", abProperty);
        if(!GL)
        {
            GL = WIND.g_pCanvas.getContext("experimental-webgl", abProperty);
            if(!GL)
            {
                // show error
                document.body.innerHTML = "Your browser does not support WebGL.";
                return;
            }
            else GL.iVersion = 0;
        }
        else GL.iVersion = 1;
    }
    else GL.iVersion = 2;

    // log context information
    console.info("Vendor: "         + GL.getParameter(GL.VENDOR));
    console.info("Renderer: "       + GL.getParameter(GL.RENDERER));
    console.info("WebGL Version: "  + GL.getParameter(GL.VERSION));
    console.info("Shader Version: " + GL.getParameter(GL.SHADING_LANGUAGE_VERSION));
    console.info(GL.getSupportedExtensions());

    // retrieve texture canvas and 2d context
    TEX = document.getElementById("texture");
    TEX.DRAW = TEX.getContext("2d");

    // setup system components
    WIND.SetupVideo();
    WIND.SetupAudio();
    WIND.SetupInput();
    WIND.SetupMenu();
    WIND.SetupRefresh();

    // init application
    APP.Init();

    // resize everything dynamically
    window.addEventListener("resize", WIND.Resize);
    WIND.Resize();

    // start engine (requestAnimationFrame() in Move())
    WIND.Move();
});


// ****************************************************************
window.addEventListener("beforeunload", function()
{
    if(!GL) return;

    // exit application
    APP.Exit();

    // cancel last animation frame
    window.cancelAnimationFrame(WIND.g_iRequestID);
});


// ****************************************************************
WIND.Render = function(iNewTime)
{
    // calculate last frame time
    const fNewSaveTime = iNewTime * 0.001;
    const fNewLastTime = Math.max(fNewSaveTime - WIND.g_fSaveTime, 0.0);
    WIND.g_fSaveTime   = fNewSaveTime;

    // smooth last frame time and increase total time
    WIND.g_fTime       = (fNewLastTime > 0.1) ? 0.001 : (0.85 * WIND.g_fTime + 0.15 * fNewLastTime);
    WIND.g_fTotalTime += WIND.g_fTime;

    // clear framebuffer
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    // render application
    APP.Render();

    // move engine
    WIND.Move();
};


// ****************************************************************
WIND.Move = function()
{
    // move application
    APP.Move();

    // update camera matrix
    mat4.lookAt(WIND.g_mCamera, WIND.g_vCamPosition, WIND.g_vCamTarget, WIND.g_vCamOrientation);

    // request next frame
    WIND.g_iRequestID = requestAnimationFrame(WIND.Render);
};


// ****************************************************************
WIND.SetupVideo = function()
{
    // load EXT_texture_filter_anisotropic extension
    GL.ExtAnisotropic = GL.getExtension("EXT_texture_filter_anisotropic");
    if(GL.ExtAnisotropic) GL.ExtAnisotropic.fMaxAnisotropy = GL.getParameter(GL.ExtAnisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT);

    // load WEBGL_provoking_vertex extension
    GL.ExtProvoking = GL.getExtension("WEBGL_provoking_vertex");
    if(GL.ExtProvoking) GL.ExtProvoking.provokingVertexWEBGL(GL.ExtProvoking.FIRST_VERTEX_CONVENTION_WEBGL);

    // setup texturing and packing
    GL.hint(GL.GENERATE_MIPMAP_HINT, GL.NICEST);
    GL.pixelStorei(GL.PACK_ALIGNMENT,   4);
    GL.pixelStorei(GL.UNPACK_ALIGNMENT, 4);
    GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);

    // setup depth testing
    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);
    GL.depthMask(true);
    GL.clearDepth(1.0);

    // setup stencil testing
    GL.disable(GL.STENCIL_TEST);
    GL.stencilMask(255);
    GL.clearStencil(0);

    // setup culling
    GL.enable(GL.CULL_FACE);
    GL.cullFace(GL.BACK);
    GL.frontFace(GL.CCW);

    // setup blending
    GL.enable(GL.BLEND);
    GL.disable(GL.SAMPLE_ALPHA_TO_COVERAGE);
    GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);
    GL.blendEquation(GL.FUNC_ADD);

    // setup shading and rasterization
    if(GL.iVersion >= 2) GL.hint(GL.FRAGMENT_SHADER_DERIVATIVE_HINT, GL.NICEST);
    GL.disable(GL.DITHER);
    GL.disable(GL.SCISSOR_TEST);
    GL.colorMask(true, true, true, true);
    GL.clearColor(0.0, 0.0, 0.0, 0.0);

    // reset scene
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
};


// ****************************************************************
WIND.SetupAudio = function()
{
    // create audio context
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    if(window.AudioContext) WIND.s_pAudioContext = new AudioContext();

    // retrieve audio stream
    WIND.g_pAudioStream = document.getElementById("stream");

    // check for supported audio format
    const sFormat = (WIND.g_pAudioStream.canPlayType && (WIND.g_pAudioStream.canPlayType("audio/ogg;codecs=opus") !== "")) ? ".opus" : ".mp3";

    // 
    WIND.g_pAudioStream.bPaused = true;
    WIND.g_pAudioStream.Load = function(sPath)
    {
        this.Pause();
        this.src = sPath + sFormat;
    };
    WIND.g_pAudioStream.Play = function()
    {
        this.bPaused = false;
        if(WIND.g_bOptionMusic) this.play();
    };
    WIND.g_pAudioStream.Pause = function()
    {
        this.bPaused = true;
        this.pause();
    };

    // try to resume an unintentional pause (just check for everything which may cause it)
    const pResume = function()
    {
        if(WIND.g_bOptionMusic && !this.bPaused) this.play();
    };
    WIND.g_pAudioStream.addEventListener("abort",   pResume);
    WIND.g_pAudioStream.addEventListener("canplay", pResume);
    WIND.g_pAudioStream.addEventListener("error",   pResume);
    WIND.g_pAudioStream.addEventListener("pause",   pResume);
    WIND.g_pAudioStream.addEventListener("stalled", pResume);
    WIND.g_pAudioStream.addEventListener("suspend", pResume);
    WIND.g_pAudioStream.addEventListener("waiting", pResume);
};


// ****************************************************************
WIND.SetupInput = function()
{
    // implement mouse event movement
    document.addEventListener("mousemove", function(pCursor)
    {
        // set mouse position relative to the canvas
        WIND.g_vMousePos[0] = pCursor.clientX*WIND.g_fMouseRange - WIND.g_fMouseRect[0];
        WIND.g_vMousePos[1] = pCursor.clientY*WIND.g_fMouseRange - WIND.g_fMouseRect[1];
    });

    // implement touch event movement
    document.addEventListener("touchmove", function(pEvent)
    {
        pEvent.preventDefault();

        // get touch input
        if(pEvent.touches.length >= 3) WIND.PauseGame(true);
        const pTouch = pEvent.touches[0];

        // set mouse position relative to the canvas
        WIND.g_vMousePos[0] = pTouch.pageX*WIND.g_fMouseRange - WIND.g_fMouseRect[0];
        WIND.g_vMousePos[1] = pTouch.pageY*WIND.g_fMouseRange - WIND.g_fMouseRect[1];
    });

    // implement mouse button input
    document.addEventListener("mousedown", function(pEvent)
    {
        APP.MouseDown(pEvent.button);
    });
    document.addEventListener("mouseup", function(pEvent)
    {
        APP.MouseUp(pEvent.button);
    });

    // implement keyboard key input
    document.addEventListener("keydown", function(pEvent)
    {
        if(pEvent.code === UTILS.KEY.ESCAPE) WIND.PauseGame(true);
        APP.KeyDown(pEvent.code);

        pEvent.preventDefault();   // prevent scrolling while in focus
    });
    document.addEventListener("keyup", function(pEvent)
    {
        APP.KeyUp(pEvent.code);
    });

    // implement auto-pause if window-focus is lost
    window.addEventListener("blur", function()
    {
        WIND.PauseGame(true);
    });
};


// ****************************************************************
WIND.SetupMenu = function()
{
    // get all menu elements
    WIND.g_pMenuLogo    = document.getElementById("logo");
    WIND.g_pMenuHeader  = document.getElementById("text-header");
    WIND.g_pMenuOption1 = document.getElementById("text-option-1");
    WIND.g_pMenuOption2 = document.getElementById("text-option-2");
    WIND.g_pMenuOption3 = document.getElementById("text-option-3");
    WIND.g_pMenuRight   = document.getElementById("text-bottom-right");
    WIND.g_pMenuLeft    = document.getElementById("text-bottom-left");
    WIND.g_pMenuVideo   = document.getElementById("text-top-right");
    WIND.g_pMenuAudio   = document.getElementById("text-top-left");
    WIND.g_pMenuStart   = document.getElementById("start");
    WIND.g_pMenuResume  = document.getElementById("resume");
    WIND.g_pMenuRestart = document.getElementById("restart");
    WIND.g_pMenuFull    = document.getElementById("fullscreen");
    WIND.g_pMenuQuality = document.getElementById("quality");
    WIND.g_pMenuMusic   = document.getElementById("music");
    WIND.g_pMenuSound   = document.getElementById("sound");

    // implement start button
    WIND.g_pMenuStart.addEventListener("mousedown", function()
    {
        WIND.StartGame();
    });

    // implement resume button
    WIND.g_pMenuResume.addEventListener("mousedown", function()
    {
        WIND.PauseGame(false);
    });

    // implement fullscreen button
    WIND.g_pMenuFull.addEventListener("click", function()   // #
    {
        if(document.fullscreenElement       || document.mozFullScreenElement ||
           document.webkitFullscreenElement || document.msFullscreenElement)
        {
            // disable fullscreen mode
                 if(document.exitFullscreen)       document.exitFullscreen();
            else if(document.mozCancelFullScreen)  document.mozCancelFullScreen();
            else if(document.webkitExitFullscreen) document.webkitExitFullscreen();
            else if(document.msExitFullscreen)     document.msExitFullscreen();
        }
        else
        {
            const pDoc = document.documentElement;

            // enable fullscreen mode
                 if(pDoc.requestFullscreen)       pDoc.requestFullscreen();
            else if(pDoc.mozRequestFullScreen)    pDoc.mozRequestFullScreen();
            else if(pDoc.webkitRequestFullscreen) pDoc.webkitRequestFullscreen();
            else if(pDoc.msRequestFullscreen)     pDoc.msRequestFullscreen();
        }
    });

    // implement quality button
    WIND.g_pMenuQuality.addEventListener("mousedown", function()
    {
        WIND.g_bOptionQuality = !WIND.g_bOptionQuality;
        this.style.color = WIND.g_bOptionQuality ? "" : "#444444";

        // call change function
        APP.ChangeOptionQuality(WIND.g_bOptionQuality);
    });

    // implement volume buttons
    WIND.g_pMenuMusic.addEventListener("mousedown", function()
    {
        WIND.g_bOptionMusic = !WIND.g_bOptionMusic;
        this.style.color = WIND.g_bOptionMusic ? "" : "#444444";

        // call change function
        APP.ChangeOptionMusic(WIND.g_bOptionMusic);
    });
    WIND.g_pMenuSound.addEventListener("mousedown", function()
    {
        WIND.g_bOptionSound = !WIND.g_bOptionSound;
        this.style.color = WIND.g_bOptionSound ? "" : "#444444";

        // call change function
        APP.ChangeOptionSound(WIND.g_bOptionSound);
    });
};


// ****************************************************************
WIND.SetupRefresh = function()
{
    if(window.requestAnimationFrame && window.cancelAnimationFrame) return;

    const asVendor = ["moz", "webkit", "ms"];

    // unify different animation functions
    for(let i = 0, ie = asVendor.length; (i < ie) && !window.requestAnimationFrame && !window.cancelAnimationFrame; ++i)
    {
        window.requestAnimationFrame = window[asVendor[i] + "RequestAnimationFrame"];
        window.cancelAnimationFrame  = window[asVendor[i] + "CancelAnimationFrame"] || window[asVendor[i] + "CancelRequestAnimationFrame"];
    }

    // implement alternatives on missing animation functions
    if(!window.requestAnimationFrame || !window.cancelAnimationFrame)
    {
        let iLastTime = 0;
        window.requestAnimationFrame = function(pCallback)
        {
            const iCurTime = new Date().getTime();
            const iTime    = Math.max(0, 16 - (iCurTime - iLastTime));

            iLastTime = iCurTime + iTime;
            return window.setTimeout(function()
            {
                pCallback(iLastTime);
            }, iTime);
        };
        window.cancelAnimationFrame = function(iID)
        {
            clearTimeout(iID);
        };
    }
};


// ****************************************************************
WIND.StartGame = function()
{
    // start game (pause will be enabled)
    WIND.g_bStarted = true;
    APP.StartGame();
};


// ****************************************************************
WIND.EndGame = function()
{
    // end game (pause will be disabled)
    WIND.PauseGame(false);
    WIND.g_bEnded = true;
};


// ****************************************************************
WIND.PauseGame = function(bStatus)
{
    // 
    if(!WIND.g_bStarted || WIND.g_bEnded)
        return;

    if(!WIND.g_bPaused && bStatus)
    {
        // implement application restart
        WIND.g_pMenuRestart.innerHTML   = "Restart";
        WIND.g_pMenuRestart.onmousedown = function()
        {
            this.innerHTML   = "<a href='" + (UTILS.asQueryParam.has("restart") ? window.location : (window.location + (window.location.search ? "&" : "?") + "restart=1")) + "'>Restart complete game ?</a>";
            this.onmousedown = null;
        };
    }
    else if(WIND.g_bPaused && !bStatus)
    {
        // 
        WIND.g_pMenuRestart.onmousedown = null;
    }

    // 
    WIND.g_bPaused = bStatus;

    // 
    APP.PauseGame(bStatus);
};


// ****************************************************************
WIND.Resize = function()
{
    // resize canvas
    const bLauncher = UTILS.asQueryParam.has("launcher");
    WIND.g_pCanvas.width  = window.innerWidth  - (bLauncher ? 2 : 0);
    WIND.g_pCanvas.height = window.innerHeight - (bLauncher ? 2 : 0);
    if(bLauncher) WIND.g_pCanvas.style.marginTop = "1px";

    // resize font
    document.body.style.fontSize = (WIND.g_pCanvas.height/800.0) * 100.0 + "%";

    // resize logo
    WIND.g_pMenuLogo.style.marginLeft = -0.5 * WIND.g_pMenuLogo.naturalWidth/WIND.g_pMenuLogo.naturalHeight * WIND.g_pCanvas.height * 0.2 + "px";

    // resize menu
    const sWidth = WIND.g_pCanvas.width + "px";
    WIND.g_pMenuHeader.style.width  = sWidth;
    WIND.g_pMenuOption1.style.width = sWidth;
    WIND.g_pMenuOption2.style.width = sWidth;
    WIND.g_pMenuOption3.style.width = sWidth;

    const sMargin = -0.5 * WIND.g_pCanvas.width + "px";
    WIND.g_pMenuHeader.style.marginLeft  = sMargin;
    WIND.g_pMenuOption1.style.marginLeft = sMargin;
    WIND.g_pMenuOption2.style.marginLeft = sMargin;
    WIND.g_pMenuOption3.style.marginLeft = sMargin;

    // set viewport and projection matrix
    GL.viewport(0, 0, WIND.g_pCanvas.width, WIND.g_pCanvas.height);
    mat4.perspective(WIND.g_mProjection, Math.PI*0.35, WIND.g_pCanvas.width / WIND.g_pCanvas.height, 0.1, 1000.0);

    // calculate mouse values
    const oRect = WIND.g_pCanvas.getBoundingClientRect();
    WIND.g_fMouseRange   = 1.0 / WIND.g_pCanvas.height;
    WIND.g_fMouseRect[0] = (oRect.left + (oRect.right  - oRect.left)/2) * WIND.g_fMouseRange;
    WIND.g_fMouseRect[1] = (oRect.top  + (oRect.bottom - oRect.top )/2) * WIND.g_fMouseRange;

    // call resize callback
    APP.Resize(sWidth, sMargin);
};