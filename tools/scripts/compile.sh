#!/bin/bash

_PATH_="$(dirname $(realpath $0))"

_EXECUTABLE_="java -jar $_PATH_/base/closure-compiler.jar"
_PARAMETERS_="--strict_mode_input --dependency_mode SORT_ONLY --language_in ECMASCRIPT_2015 --language_out ECMASCRIPT_2015 --js '$_PATH_/../../source/**.js' --js '$1' --js_output_file $2"

if [ "$3" == "release" ]; then
    _PARAMETERS_="$_PARAMETERS_ --compilation_level ADVANCED --assume_function_wrapper --hide_warnings_for gl-matrix --jscomp_off globalThis"
else
    _PARAMETERS_="$_PARAMETERS_ --compilation_level BUNDLE"
fi

echo $_PARAMETERS_

$_EXECUTABLE_ $_PARAMETERS_