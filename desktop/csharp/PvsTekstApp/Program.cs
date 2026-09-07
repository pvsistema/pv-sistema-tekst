using System.Diagnostics;

namespace PvsTekstApp;

internal static class Program
{
    /// <summary>Точка входа: одно окно на приложение.</summary>
    [STAThread]
    private static void Main(string[] args)
    {
        /* путь к файлу, с которого запустили программу двойным кликом */
        var startupFile = args.FirstOrDefault(a => !a.StartsWith('-') && File.Exists(a));

        using var mutex = new Mutex(true, "PVSTEKST_SingleInstance", out bool isFirst);
        if (!isFirst)
        {
            /* программа уже открыта — передаём файл в её окно */
            SingleInstance.SendToRunningApp(startupFile);
            return;
        }

        /* нужна для чтения старых файлов в кодировке Windows-1251 */
        System.Text.Encoding.RegisterProvider(
            System.Text.CodePagesEncodingProvider.Instance);

        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);
        Application.SetHighDpiMode(HighDpiMode.PerMonitorV2);

        Application.ThreadException += (_, e) => ShowFatal(e.Exception);
        AppDomain.CurrentDomain.UnhandledException += (_, e) =>
            ShowFatal(e.ExceptionObject as Exception);

        var form = new MainForm(startupFile);
        SingleInstance.StartListener(path => form.OpenFileFromShell(path));
        Application.Run(form);
    }

    private static void ShowFatal(Exception? ex)
    {
        var text = ex?.ToString() ?? "Неизвестная ошибка";
        try
        {
            var log = Path.Combine(AppContext.BaseDirectory, "error.log");
            File.AppendAllText(log, $"{DateTime.Now:g}\n{text}\n\n");
        }
        catch
        {
            // журнал недоступен — показываем только окно
        }

        MessageBox.Show(
            "Произошла ошибка. Подробности записаны в error.log рядом с программой.\n\n"
                + (ex?.Message ?? string.Empty),
            "ПВ-Система Текст",
            MessageBoxButtons.OK,
            MessageBoxIcon.Error);
    }
}