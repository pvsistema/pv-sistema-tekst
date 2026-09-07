using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace PvsTekstApp;

/// <summary>Главное окно: интерфейс редактора внутри WebView2.</summary>
public sealed class MainForm : Form
{
    private readonly WebView2 _web = new() { Dock = DockStyle.Fill };
    private const string VirtualHost = "app.pvstekst";

    public MainForm()
    {
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

        core.Navigate($"https://{VirtualHost}/index.html");
    }

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
