@echo off
setlocal
set "MAVEN_PROJECTBASEDIR=%~dp0"
set "WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar"

if not exist "%WRAPPER_JAR%" (
    echo Maven Wrapper JAR is missing: "%WRAPPER_JAR%"
    exit /b 1
)

if defined JAVA_HOME (
    "%JAVA_HOME%\bin\java.exe" "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%." -classpath "%WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*
) else (
    java "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%." -classpath "%WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*
)
exit /b %ERRORLEVEL%
