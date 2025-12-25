import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { useAuth } from '../lib/auth';
import { Settings as SettingsIcon, Sun, Moon, Monitor, Save } from 'lucide-react';

type Theme = 'default' | 'light' | 'dark';

export function Settings() {
  const { user } = useAuth();
  const [theme, setTheme] = useState<Theme>('default');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (selectedTheme: Theme) => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('theme-light', 'theme-dark', 'theme-default');
    
    // Apply selected theme
    if (selectedTheme !== 'default') {
      root.classList.add(`theme-${selectedTheme}`);
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const themes: { value: Theme; label: string; icon: typeof Sun; description: string }[] = [
    { value: 'default', label: 'Default', icon: Monitor, description: 'Dark Steam-inspired theme' },
    { value: 'light', label: 'Light', icon: Sun, description: 'Light theme for daytime' },
    { value: 'dark', label: 'Dark', icon: Moon, description: 'Pure dark theme' },
  ];

  return (
    <div className="min-h-screen bg-[#1b2838]">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 p-6 rounded-lg bg-gradient-to-r from-[#2a475e] to-[#1e3447] border border-[#2a475e]">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] flex items-center justify-center">
              <SettingsIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl text-[#c7d5e0]" style={{ fontWeight: 700 }}>Settings</h1>
              <p className="text-[#8f98a0]">Customize your GameHaqqs experience</p>
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <Card className="border-[#2a475e] steam-card mb-6">
          <CardHeader>
            <CardTitle className="text-[#c7d5e0]">Appearance</CardTitle>
            <CardDescription className="text-[#8f98a0]">
              Choose your preferred theme mode
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label className="text-[#c7d5e0]">Theme Mode</Label>
              <div className="grid md:grid-cols-3 gap-4">
                {themes.map((themeOption) => {
                  const Icon = themeOption.icon;
                  return (
                    <button
                      key={themeOption.value}
                      onClick={() => handleThemeChange(themeOption.value)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        theme === themeOption.value
                          ? 'border-[#66c0f4] bg-[#66c0f4]/10'
                          : 'border-[#2a475e] bg-[#2a475e]/30 hover:border-[#66c0f4]/50'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <Icon className={`h-8 w-8 ${theme === themeOption.value ? 'text-[#66c0f4]' : 'text-[#8f98a0]'}`} />
                        <div className="text-center">
                          <p className={`font-semibold mb-1 ${theme === themeOption.value ? 'text-[#66c0f4]' : 'text-[#c7d5e0]'}`}>
                            {themeOption.label}
                          </p>
                          <p className="text-xs text-[#8f98a0]">{themeOption.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#2a475e]">
              <div>
                {saved && (
                  <p className="text-sm text-green-400">✓ Theme saved successfully!</p>
                )}
              </div>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-[#66c0f4] to-[#2a75bb] hover:from-[#5ab0e0] hover:to-[#236ba8] text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="border-[#2a475e] steam-card">
          <CardHeader>
            <CardTitle className="text-[#c7d5e0]">Account Information</CardTitle>
            <CardDescription className="text-[#8f98a0]">
              Your account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-[#8f98a0] text-sm">Username</Label>
              <p className="text-[#c7d5e0] mt-1">{user?.username}</p>
            </div>
            <div>
              <Label className="text-[#8f98a0] text-sm">Email</Label>
              <p className="text-[#c7d5e0] mt-1">{user?.email}</p>
            </div>
            <div>
              <Label className="text-[#8f98a0] text-sm">Role</Label>
              <p className="text-[#c7d5e0] mt-1 capitalize">{user?.role}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
