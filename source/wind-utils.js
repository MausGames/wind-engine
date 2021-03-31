///////////////////////////////////////////////////////////
//*-----------------------------------------------------*//
//| Part of the Wind Engine (https://www.maus-games.at) |//
//*-----------------------------------------------------*//
//| Released under the zlib License                     |//
//| More information available in the readme file       |//
//*-----------------------------------------------------*//
///////////////////////////////////////////////////////////
"use strict";
const UTILS = {};


// ****************************************************************
// import glMatrix into global space
const mat2  = this.glMatrix.mat2;
const mat3  = this.glMatrix.mat3;
const mat4  = this.glMatrix.mat4;
const vec2  = this.glMatrix.vec2;
const vec3  = this.glMatrix.vec3;
const vec4  = this.glMatrix.vec4;
const quat  = this.glMatrix.quat;

// fix performance regression
this.glMatrix.glMatrix.setMatrixArrayType(Array);


// ****************************************************************
// get URL parameters
UTILS.asQueryParam = function()
{
    const asOutput = new Map();
    const asList   = window.location.search.substring(1).split("&");

    // loop through all parameters
    for(let i = 0, ie = asList.length; i < ie; ++i)
    {
        // separate key from value
        const asPair = asList[i].split("=");

        // insert value into map
        if(!asOutput.has(asPair[0]))
            asOutput.set(asPair[0], asPair[1]);                              // create new entry
        else if(typeof asOutput.get(asPair[0]) === "string")
            asOutput.set(asPair[0], [asOutput.get(asPair[0]), asPair[1]]);   // extend into array
        else
            asOutput.get(asPair[0]).push(asPair[1]);                         // append to array
    }

    return asOutput;
}();


// ****************************************************************
UTILS.Clamp = function(fValue, fFrom, fTo)
{
    return Math.min(Math.max(fValue, fFrom), fTo);
};


// ****************************************************************
UTILS.Pow2 = function(fValue)
{
    return fValue * fValue;
};

UTILS.Pow3 = function(fValue)
{
    return fValue * fValue * fValue;
};


// ****************************************************************
UTILS.Lerp = function(x, y, s)
{
    return x * (1.0 - s) + y * s;
};

UTILS.LerpSmooth = function(x, y, s)
{
    return UTILS.Lerp(x, y, 0.5 - 0.5 * Math.cos(s * Math.PI));
};

UTILS.LerpBreak = function(x, y, s)
{
    return UTILS.Lerp(x, y, Math.sin(s * (Math.PI * 0.5)));
};

UTILS.LerpHermite3 = function(x, y, s)
{
    return UTILS.Lerp(x, y, (3.0 - 2.0 * s) * s * s);
};

UTILS.LerpHermite5 = function(x, y, s)
{
    return UTILS.Lerp(x, y, (10.0 + (-15.0 + 6.0 * s) * s) * s * s * s);
};


// ****************************************************************
UTILS.Step = function(a, b, x)
{
    return UTILS.Clamp((x - a) / (b - a), 0.0, 1.0);
};

UTILS.StepHermite3 = function(a, b, x)
{
    return UTILS.LerpHermite3(0.0, 1.0, UTILS.Step(a, b, x)); 
};

UTILS.StepHermite5 = function(a, b, x)
{
    return UTILS.LerpHermite5 (0.0, 1.0, UTILS.Step(a, b, x));
};


// ****************************************************************
UTILS.Rand = Math.random;

UTILS.RandInt = function(iMin, iMax)
{
    return Math.floor(UTILS.RandFloat(iMin, iMax + 1));
};

UTILS.RandFloat = function(fMin, fMax)
{
    return fMin + UTILS.Rand() * (fMax - fMin);
};

UTILS.RandBool = function(fChance)
{
    return (UTILS.Rand() < fChance);
};


// ****************************************************************
UTILS.Vec2Reflect = function(vOutput, vVelocity, vNormal)
{
    const fDot = vec2.dot(vVelocity, vNormal);
    if(fDot <= 0.0)
    {
        vOutput[0] = vVelocity[0] - vNormal[0] * fDot * 2.0;
        vOutput[1] = vVelocity[1] - vNormal[1] * fDot * 2.0;
    }

    return vOutput;
};


// ****************************************************************
UTILS.Vec2Direction = function(vOutput, fAngle)
{
    vOutput[0] = -Math.sin(fAngle);
    vOutput[1] =  Math.cos(fAngle);

    return vOutput;
};

UTILS.Vec2Angle = function(vVector)
{
    return -Math.atan2(vVector[0], vVector[1])
};


// ****************************************************************
UTILS.Vec3RgbToHsv = function(vOutput, x, y, z)
{
    const R = x;
    const G = y;
    const B = z;

    const v = Math.max(R, G, B);
    const d = v - Math.min(R, G, B);

    if(!d) return vec3.set(vOutput, 0.0, 0.0, v);

    const  s = d / v;

    if(R === v) return vec3.set(vOutput, (0.0 + (G - B) / d) / 6.0, s, v);
    if(G === v) return vec3.set(vOutput, (2.0 + (B - R) / d) / 6.0, s, v);
                return vec3.set(vOutput, (4.0 + (R - G) / d) / 6.0, s, v);
};

UTILS.Vec3HsvToRgb = function(vOutput, x, y, z)
{
    const H = x * 6.0;
    const S = y;
    const V = z;

    const h = Math.floor(H);

    const s = V * S;
    const t = s * (H - h);
    const p = V - s;

    switch(h)
    {
    case 1:  return vec3.set(vOutput, V - t, V,     p);
    case 2:  return vec3.set(vOutput, p,     V,     p + t);
    case 3:  return vec3.set(vOutput, p,     V - t, V);
    case 4:  return vec3.set(vOutput, p + t, p,     V);
    case 5:  return vec3.set(vOutput, V,     p,     V - t);
    default: return vec3.set(vOutput, V,     p + t, p);
    }
};


// ****************************************************************
UTILS.PackUnorm32To16 = function(fValue)
{
    return Math.floor(fValue * 65535.0);
};

UTILS.PackSnorm32To16 = function(fValue)
{
    return Math.floor((fValue < 0.0) ? (65536.0 + fValue * 32768.0) : (fValue * 32767.0));
};

UTILS.PackUnorm32To8 = function(fValue)
{
    return Math.floor(fValue * 255.0);
};

UTILS.PackSnorm32To8 = function(fValue)
{
    return Math.floor((fValue < 0.0) ? (256.0 + fValue * 128.0) : (fValue * 127.0));
};


// ****************************************************************
UTILS.CURSOR_NONE      = "none";
UTILS.CURSOR_AUTO      = "auto";
UTILS.CURSOR_CROSSHAIR = "crosshair";
UTILS.SetCursor = function(sCursor)
{
    // change cursor style
    document.body.style.cursor = sCursor;
};


// ****************************************************************
UTILS.SetElementOpacity = function(pElement, fOpacity)
{
    const sDisplay = (fOpacity <= 0.01) ? "none" : "block";

    // set opacity of element and remove it completely when low
    if(pElement.style.opacity !== fOpacity) pElement.style.opacity = fOpacity;
    if(pElement.style.display !== sDisplay) pElement.style.display = sDisplay;
};


// ****************************************************************
UTILS.SetElementEnabled = function(pElement, bEnabled)
{
    // set interaction behavior of element
    pElement.style.pointerEvents = bEnabled ? "auto" : "none";
};


// ****************************************************************
UTILS.KEY =
{
    ENTER:  "Enter",
    ESCAPE: "Escape",
    SPACE:  "Space",
    LEFT:   "ArrowLeft",
    UP:     "ArrowUp",
    RIGHT:  "ArrowRight",
    DOWN:   "ArrowDown",
    A:      "KeyA",
    B:      "KeyB",
    C:      "KeyC",
    D:      "KeyD",
    E:      "KeyE",
    F:      "KeyF",
    G:      "KeyG",
    H:      "KeyH",
    I:      "KeyI",
    J:      "KeyJ",
    K:      "KeyK",
    L:      "KeyL",
    M:      "KeyM",
    N:      "KeyN",
    O:      "KeyO",
    P:      "KeyP",
    Q:      "KeyQ",
    R:      "KeyR",
    S:      "KeyS",
    T:      "KeyT",
    U:      "KeyU",
    V:      "KeyV",
    W:      "KeyW",
    X:      "KeyX",
    Y:      "KeyY",
    Z:      "KeyZ",
};