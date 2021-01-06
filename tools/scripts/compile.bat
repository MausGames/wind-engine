@ECHO OFF

SET _EXECUTABLE_=java -jar "%~dp0base\closure-compiler.jar"
SET _PARAMETERS_=--strict_mode_input --dependency_mode SORT_ONLY --language_in ECMASCRIPT_2015 --language_out ECMASCRIPT_2015 --js '%~dp0..\..\source\**.js' --js '%~1' --js_output_file %~2

IF "%~3" == "release" (
    SET _PARAMETERS_=%_PARAMETERS_% --compilation_level ADVANCED --assume_function_wrapper --hide_warnings_for gl-matrix --jscomp_off globalThis
) ELSE (
    SET _PARAMETERS_=%_PARAMETERS_% --compilation_level BUNDLE
)

ECHO %_PARAMETERS_%

CALL %_EXECUTABLE_% %_PARAMETERS_%