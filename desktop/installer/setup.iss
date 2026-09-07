; Установщик «ПВ-Система Текст».
; Собирается командой: desktop\csharp\build.bat installer
; Параметры передаёт build.bat: AppVersion, SourceDir, OutputDir.

#ifndef AppVersion
  #define AppVersion "1.0.0"
#endif
#ifndef SourceDir
  #define SourceDir "..\csharp\dist"
#endif
#ifndef OutputDir
  #define OutputDir "..\csharp\installer-out"
#endif

#define AppName "ПВ-Система Текст"
#define AppExe "PVSTEKST.exe"
#define AppPublisher "ПВ-Система"

[Setup]
AppId={{B7A41E62-4C93-4F1D-9E77-2C5A8D3F1E04}
AppName={#AppName}
AppVersion={#AppVersion}
AppVerName={#AppName} {#AppVersion}
AppPublisher={#AppPublisher}
DefaultDirName=C:\PVSTEKST
DefaultGroupName={#AppName}
DisableProgramGroupPage=yes
DisableDirPage=no
UninstallDisplayIcon={app}\{#AppExe}
OutputDir={#OutputDir}
OutputBaseFilename=PVSTEKST-Setup-{#AppVersion}
Compression=lzma2/max
SolidCompression=yes
WizardStyle=modern
ArchitecturesInstallIn64BitMode=x64compatible
ArchitecturesAllowed=x64compatible
PrivilegesRequired=admin

[Languages]
Name: "russian"; MessagesFile: "compiler:Languages\Russian.isl"

[Tasks]
Name: "desktopicon"; Description: "Создать значок на рабочем столе"; GroupDescription: "Дополнительные значки:"

[Files]
Source: "{#SourceDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "MicrosoftEdgeWebview2Setup.exe"; DestDir: "{tmp}"; Flags: deleteafterinstall dontcopy skipifsourcedoesntexist

[Registry]
; Собственный тип файла программы
Root: HKCR; Subkey: "PVSTEKST.Document"; ValueType: string; ValueName: ""; ValueData: "Документ {#AppName}"; Flags: uninsdeletekey
Root: HKCR; Subkey: "PVSTEKST.Document\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\{#AppExe},0"
Root: HKCR; Subkey: "PVSTEKST.Document\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#AppExe}"" ""%1"""

; Программа в списке «Открыть с помощью» для документов
Root: HKCR; Subkey: "Applications\{#AppExe}\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#AppExe}"" ""%1"""; Flags: uninsdeletekey
Root: HKCR; Subkey: "Applications\{#AppExe}\SupportedTypes"; ValueType: string; ValueName: ".doc"; ValueData: ""
Root: HKCR; Subkey: "Applications\{#AppExe}\SupportedTypes"; ValueType: string; ValueName: ".docx"; ValueData: ""
Root: HKCR; Subkey: "Applications\{#AppExe}\SupportedTypes"; ValueType: string; ValueName: ".txt"; ValueData: ""
Root: HKCR; Subkey: "Applications\{#AppExe}\SupportedTypes"; ValueType: string; ValueName: ".rtf"; ValueData: ""
Root: HKCR; Subkey: "Applications\{#AppExe}\SupportedTypes"; ValueType: string; ValueName: ".html"; ValueData: ""

; Пункт «Открыть с помощью» в контекстном меню знакомых типов
Root: HKCR; Subkey: ".doc\OpenWithProgids"; ValueType: string; ValueName: "PVSTEKST.Document"; ValueData: ""; Flags: uninsdeletevalue
Root: HKCR; Subkey: ".docx\OpenWithProgids"; ValueType: string; ValueName: "PVSTEKST.Document"; ValueData: ""; Flags: uninsdeletevalue
Root: HKCR; Subkey: ".txt\OpenWithProgids"; ValueType: string; ValueName: "PVSTEKST.Document"; ValueData: ""; Flags: uninsdeletevalue
Root: HKCR; Subkey: ".rtf\OpenWithProgids"; ValueType: string; ValueName: "PVSTEKST.Document"; ValueData: ""; Flags: uninsdeletevalue
Root: HKCR; Subkey: ".html\OpenWithProgids"; ValueType: string; ValueName: "PVSTEKST.Document"; ValueData: ""; Flags: uninsdeletevalue

; Регистрация приложения для окна «Приложения по умолчанию» Windows
Root: HKLM; Subkey: "SOFTWARE\RegisteredApplications"; ValueType: string; ValueName: "{#AppName}"; ValueData: "SOFTWARE\{#AppName}\Capabilities"; Flags: uninsdeletevalue
Root: HKLM; Subkey: "SOFTWARE\{#AppName}\Capabilities"; ValueType: string; ValueName: "ApplicationName"; ValueData: "{#AppName}"; Flags: uninsdeletekey
Root: HKLM; Subkey: "SOFTWARE\{#AppName}\Capabilities"; ValueType: string; ValueName: "ApplicationDescription"; ValueData: "Редактор текстовых документов"
Root: HKLM; Subkey: "SOFTWARE\{#AppName}\Capabilities\FileAssociations"; ValueType: string; ValueName: ".doc"; ValueData: "PVSTEKST.Document"
Root: HKLM; Subkey: "SOFTWARE\{#AppName}\Capabilities\FileAssociations"; ValueType: string; ValueName: ".docx"; ValueData: "PVSTEKST.Document"
Root: HKLM; Subkey: "SOFTWARE\{#AppName}\Capabilities\FileAssociations"; ValueType: string; ValueName: ".rtf"; ValueData: "PVSTEKST.Document"

[Icons]
Name: "{group}\{#AppName}"; Filename: "{app}\{#AppExe}"; IconFilename: "{app}\pvstekst.ico"
Name: "{group}\Удалить {#AppName}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#AppName}"; Filename: "{app}\{#AppExe}"; IconFilename: "{app}\pvstekst.ico"; Tasks: desktopicon

[Run]
Filename: "{app}\{#AppExe}"; Description: "Запустить {#AppName}"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
Type: filesandordirs; Name: "{app}\web"
Type: files; Name: "{app}\error.log"

[Code]
{ Сообщаем Проводнику о новых типах файлов, иначе значки обновятся не сразу. }
const
  SHCNE_ASSOCCHANGED = $08000000;
  SHCNF_IDLIST = $0000;

procedure SHChangeNotify(wEventId, uFlags: Integer; dwItem1, dwItem2: Integer);
  external 'SHChangeNotify@shell32.dll stdcall';

{ Проверяем WebView2: без него окно программы останется пустым. }
function WebView2Installed(): Boolean;
var
  Value: String;
begin
  Result :=
    RegQueryStringValue(HKLM, 'SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}', 'pv', Value) or
    RegQueryStringValue(HKLM, 'SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}', 'pv', Value) or
    RegQueryStringValue(HKCU, 'SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}', 'pv', Value);
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  ResultCode: Integer;
begin
  if CurStep = ssPostInstall then
    SHChangeNotify(SHCNE_ASSOCCHANGED, SHCNF_IDLIST, 0, 0);

  if (CurStep = ssPostInstall) and not WebView2Installed() then
  begin
    try
      ExtractTemporaryFile('MicrosoftEdgeWebview2Setup.exe');
      Exec(ExpandConstant('{tmp}\MicrosoftEdgeWebview2Setup.exe'), '/silent /install',
        '', SW_SHOW, ewWaitUntilTerminated, ResultCode);
    except
      MsgBox('Не удалось установить компонент WebView2.' + #13#10 +
        'Скачайте его вручную: https://go.microsoft.com/fwlink/p/?LinkId=2124703',
        mbInformation, MB_OK);
    end;
  end;
end;