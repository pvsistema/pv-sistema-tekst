using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace PvsTekstApp;

/// <summary>Главное окно: интерфейс редактора внутри WebView2.</summary>
public sealed class MainForm : Form
{
    private readonly WebView2 _web = new() { Dock = DockStyle.Fill };
    private const string VirtualHost = "app.pvstekst";

    private string? _startupFile;
    private bool _ready;

    public MainForm(string? startupFile = null)
    {
        _startupFile = startupFile;

        Text = "ПВ-Система Текст";
        StartPosition = FormStartPosition.CenterScreen;
        WindowState = FormWindowState.Maximized;
        MinimumSize = new Size(1024, 640);
        BackColor = Color.White;

        var ico = Path.Combine(AppContext.BaseDirectory, "pvstekst.ico");
        if (File.Exists(ico)) Icon = new Icon(ico);

        Controls.Add(_web);
        Load += async (_, _) => await StartAsync();
    }

    private async Task StartAsync()
    {
        var webDir = Path.Combine(AppContext.BaseDirectory, "web");
        var index = Path.Combine(webDir, "index.html");

        if (!File.Exists(index))
        {
            MessageBox.Show(
                "Не найдены файлы интерфейса (папка web рядом с программой).\n"
                    + "Переустановите приложение.",
                "ПВ-Система Текст",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);
            Close();
            return;
        }

        var dataDir = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "PVSTEKST");
        Directory.CreateDirectory(dataDir);

        CoreWebView2Environment env;
        try
        {
            env = await CoreWebView2Environment.CreateAsync(null, dataDir);
        }
        catch (Exception)
        {
            MessageBox.Show(
                "Не установлен компонент Microsoft Edge WebView2.\n"
                    + "Установите его и запустите программу снова:\n"
                    + "https://go.microsoft.com/fwlink/p/?LinkId=2124703",
                "ПВ-Система Текст",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);
            Close();
            return;
        }

        await _web.EnsureCoreWebView2Async(env);
        var core = _web.CoreWebView2;

        core.SetVirtualHostNameToFolderMapping(
            VirtualHost, webDir, CoreWebView2HostResourceAccessKind.Allow);

        core.Settings.AreDefaultContextMenusEnabled = false;
        core.Settings.AreBrowserAcceleratorKeysEnabled = false;
        core.Settings.IsStatusBarEnabled = false;
        core.Settings.IsSwipeNavigationEnabled = false;
        core.Settings.AreDevToolsEnabled = false;
        core.Settings.IsZoomControlEnabled = false;

        /* печать и внешние ссылки открываем сами, новое окно не создаём */
        core.NewWindowRequested += (_, e) =>
        {
            e.Handled = true;
            if (e.Uri.StartsWith("http", StringComparison.OrdinalIgnoreCase))
            {
                System.Diagnostics.Process.Start(
                    new System.Diagnostics.ProcessStartInfo(e.Uri) { UseShellExecute = true });
            }
        };

        core.DocumentTitleChanged += (_, _) =>
        {
            var t = core.DocumentTitle;
            Text = string.IsNullOrWhiteSpace(t) ? "ПВ-Система Текст" : t;
        };

        /* файл, с которого запустили программу, кладём в страницу до её загрузки */
        if (_startupFile is not null
            && TryReadDocument(_startupFile, out var name, out var data))
        {
            var script =
                "window.pvsStartupFile = { name: " + ToJs(name) +
                ", data: " + ToJs(data) + " };";
            await core.AddScriptToExecuteOnDocumentCreatedAsync(script);
            _startupFile = null;
        }

        core.NavigationCompleted += (_, _) => _ready = true;
        core.Navigate($"https://{VirtualHost}/index.html");
    }

    /// <summary>Открывает документ, переданный из Проводника при работающей программе.</summary>
    public void OpenFileFromShell(string path)
    {
        if (IsDisposed) return;

        BeginInvoke(() =>
        {
            if (WindowState == FormWindowState.Minimized)
                WindowState = FormWindowState.Maximized;
            Activate();
            BringToFront();

            if (!_ready || _web.CoreWebView2 is null)
            {
                _startupFile = path;
                return;
            }

            if (!TryReadDocument(path, out var name, out var data)) return;

            _web.CoreWebView2.ExecuteScriptAsync(
                "window.postMessage({ type: 'pvs-open-file', name: " + ToJs(name) +
                ", data: " + ToJs(data) + " }, '*');");
        });
    }

    /// <summary>
    /// Читает файл как есть и кодирует в base64. Документ .docx — это архив,
    /// поэтому превращать его в текст нельзя: разбором занимается редактор.
    /// </summary>
    private static bool TryReadDocument(string path, out string name, out string data)
    {
        name = Path.GetFileName(path);
        data = string.Empty;

        try
        {
            var info = new FileInfo(path);
            if (info.Length > 40_000_000)
            {
                MessageBox.Show(
                    "Файл слишком большой для открытия.",
                    "ПВ-Система Текст",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Warning);
                return false;
            }

            data = Convert.ToBase64String(File.ReadAllBytes(path));
            return true;
        }
        catch (Exception ex)
        {
            MessageBox.Show(
                "Не удалось открыть файл:\n" + ex.Message,
                "ПВ-Система Текст",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);
            return false;
        }
    }

    /// <summary>Безопасно превращает текст в строку JavaScript.</summary>
    private static string ToJs(string value) =>
        System.Text.Json.JsonSerializer.Serialize(value);

    protected override bool ProcessCmdKey(ref Message msg, Keys keyData)
    {
        /* F11 — полноэкранный режим */
        if (keyData == Keys.F11)
        {
            if (FormBorderStyle == FormBorderStyle.None)
            {
                FormBorderStyle = FormBorderStyle.Sizable;
                WindowState = FormWindowState.Maximized;
            }
            else
            {
                WindowState = FormWindowState.Normal;
                FormBorderStyle = FormBorderStyle.None;
                WindowState = FormWindowState.Maximized;
            }

            return true;
        }

        return base.ProcessCmdKey(ref msg, keyData);
    }
}
