using System.Diagnostics;

namespace PvsTekstApp;

internal static class Program
{
    /// <summary>Точка входа: одно окно на приложение.</summary>
    [STAThread]
    private static void Main()
    {
        using var mutex = new Mutex(true, "PVSTEKST_SingleInstance", out bool isFirst);
        if (!isFirst)
        {
            MessageBox.Show(
                "ПВ-Система Текст уже запущена.",
                "ПВ-Система Текст",
                MessageBoxButtons.OK,
                MessageBoxIcon.Information);
            return;
        }

        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);
        Application.SetHighDpiMode(HighDpiMode.PerMonitorV2);

        Application.ThreadException += (_, e) => ShowFatal(e.Exception);
        AppDomain.CurrentDomain.UnhandledException += (_, e) =>
            ShowFatal(e.ExceptionObject as Exception);

        Application.Run(new MainForm());
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
