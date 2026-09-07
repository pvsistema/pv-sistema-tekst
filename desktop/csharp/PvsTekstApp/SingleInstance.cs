using System.IO.Pipes;
using System.Text;

namespace PvsTekstApp;

/// <summary>
/// Передаёт путь к файлу уже запущенному окну программы,
/// чтобы двойной клик по документу не открывал второе окно.
/// </summary>
internal static class SingleInstance
{
    private const string PipeName = "PVSTEKST_OpenFile";

    /// <summary>Отправляет путь работающей программе и выводит её окно вперёд.</summary>
    public static void SendToRunningApp(string? filePath)
    {
        try
        {
            using var client = new NamedPipeClientStream(".", PipeName, PipeDirection.Out);
            client.Connect(2000);
            var data = Encoding.UTF8.GetBytes(filePath ?? string.Empty);
            client.Write(data, 0, data.Length);
            client.Flush();
        }
        catch
        {
            MessageBox.Show(
                "ПВ-Система Текст уже запущена.",
                "ПВ-Система Текст",
                MessageBoxButtons.OK,
                MessageBoxIcon.Information);
        }
    }

    /// <summary>Ждёт пути к файлам от повторных запусков программы.</summary>
    public static void StartListener(Action<string> onFile)
    {
        var thread = new Thread(() =>
        {
            while (true)
            {
                try
                {
                    using var server = new NamedPipeServerStream(
                        PipeName, PipeDirection.In, 1,
                        PipeTransmissionMode.Byte, PipeOptions.None);

                    server.WaitForConnection();

                    using var reader = new StreamReader(server, Encoding.UTF8);
                    var path = reader.ReadToEnd().Trim();
                    if (!string.IsNullOrEmpty(path)) onFile(path);
                }
                catch
                {
                    Thread.Sleep(500);
                }
            }
        })
        {
            IsBackground = true,
            Name = "PVSTEKST open-file listener",
        };

        thread.Start();
    }
}
