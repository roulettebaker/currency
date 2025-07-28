import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Shield, Bell, Globe, HelpCircle, ChevronRight, Eye, EyeOff } from 'lucide-react';

export default function Settings() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const settingsOptions = [
    {
      icon: User,
      title: 'Account Management',
      description: 'Manage your wallet accounts',
      action: () => console.log('Account Management')
    },
    {
      icon: Shield,
      title: 'Security',
      description: 'Password, biometrics, and backup',
      action: () => console.log('Security')
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Push notifications and alerts',
      toggle: true,
      value: notifications,
      onChange: setNotifications
    },
    {
      icon: Globe,
      title: 'Language & Region',
      description: 'App language and currency',
      action: () => console.log('Language & Region')
    },
    {
      icon: HelpCircle,
      title: 'Help & Support',
      description: 'FAQ, contact support',
      action: () => console.log('Help & Support')
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center">
          <Link to="/" className="mr-4 hover:bg-secondary p-1 rounded">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-lg font-medium text-white">Settings</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Privacy Settings */}
        <div className="bg-secondary border border-border rounded-lg p-4">
          <h2 className="text-white font-medium mb-4">Privacy</h2>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {balanceVisible ? (
                <Eye className="w-5 h-5 text-muted-foreground" />
              ) : (
                <EyeOff className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <div className="text-white">Hide Balance</div>
                <div className="text-muted-foreground text-sm">
                  Hide balance amounts on main screen
                </div>
              </div>
            </div>
            <button
              onClick={() => setBalanceVisible(!balanceVisible)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                !balanceVisible ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  !balanceVisible ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* General Settings */}
        <div className="bg-secondary border border-border rounded-lg p-4">
          <h2 className="text-white font-medium mb-4">General</h2>
          
          <div className="space-y-4">
            {settingsOptions.map((option, index) => (
              <div key={index}>
                {option.toggle ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <option.icon className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="text-white">{option.title}</div>
                        <div className="text-muted-foreground text-sm">
                          {option.description}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => option.onChange?.(!option.value)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        option.value ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                          option.value ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={option.action}
                    className="w-full flex items-center justify-between hover:bg-accent p-2 rounded transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <option.icon className="w-5 h-5 text-muted-foreground" />
                      <div className="text-left">
                        <div className="text-white">{option.title}</div>
                        <div className="text-muted-foreground text-sm">
                          {option.description}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                )}
                {index < settingsOptions.length - 1 && (
                  <div className="border-t border-border my-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* App Information */}
        <div className="bg-secondary border border-border rounded-lg p-4">
          <h2 className="text-white font-medium mb-4">About</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span className="text-white">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Build</span>
              <span className="text-white">2024.01.15</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network</span>
              <span className="text-white">Mainnet</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <h2 className="text-red-400 font-medium mb-4">Danger Zone</h2>
          
          <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors">
            Reset Wallet
          </button>
          <p className="text-red-400 text-sm mt-2 text-center">
            This will permanently delete all wallet data
          </p>
        </div>
      </div>
    </div>
  );
}
