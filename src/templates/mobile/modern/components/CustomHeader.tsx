import React from "react";
import { ArrowLeft, Search, Bell } from "lucide-react";

interface AppConfig {
  primaryColor: string;
  secondaryColor: string;
  appName?: string;
}

interface CustomHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showNotification?: boolean;
  showSearch?: boolean;
  onBackPress?: () => void;
  onNotificationPress?: () => void;
  onSearchPress?: () => void;
  appConfig: AppConfig;
  notificationCount?: number;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  showNotification = true,
  showSearch = false,
  onBackPress,
  onNotificationPress,
  onSearchPress,
  appConfig,
  notificationCount = 0,
}) => {
  const gradientStyle = {
    background: `linear-gradient(135deg, ${appConfig.primaryColor}, ${appConfig.secondaryColor})`,
  };

  return (
    <>
      <style jsx>{`
        .safe-area {
          background-color: #667eea;
        }
        .header {
          padding: 15px 20px;
        }
        .header-content {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }
        .left-section {
          flex: 1;
          display: flex;
          flex-direction: row;
          align-items: center;
        }
        .center-section {
          flex: 2;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .right-section {
          flex: 1;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: flex-end;
        }
        .back-button {
          padding: 5px;
          margin-right: 10px;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .title-container {
          flex: 1;
        }
        .title {
          color: #fff;
          font-size: 18px;
          font-weight: bold;
          margin: 0;
        }
        .subtitle {
          color: #fff;
          font-size: 14px;
          opacity: 0.9;
          margin: 2px 0 0 0;
        }
        .center-title {
          color: #fff;
          font-size: 18px;
          font-weight: bold;
          text-align: center;
          margin: 0;
        }
        .icon-button {
          padding: 8px;
          margin-left: 10px;
          position: relative;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .notification-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          background-color: #ff4757;
          border-radius: 10px;
          min-width: 20px;
          height: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0 4px;
        }
        .notification-count {
          color: #fff;
          font-size: 11px;
          font-weight: bold;
        }
      `}</style>
      <div className="safe-area">
        <div className="header" style={gradientStyle}>
          <div className="header-content">
            {/* Left Section */}
            <div className="left-section">
              {showBack ? (
                <button
                  className="back-button"
                  onClick={onBackPress}
                  type="button"
                >
                  <ArrowLeft size={24} color="#fff" />
                </button>
              ) : (
                <div className="title-container">
                  {title && <h1 className="title">{title}</h1>}
                  {subtitle && <p className="subtitle">{subtitle}</p>}
                </div>
              )}
            </div>

            {/* Center Section */}
            {showBack && title && (
              <div className="center-section">
                <h1 className="center-title">{title}</h1>
              </div>
            )}

            {/* Right Section */}
            <div className="right-section">
              {showSearch && (
                <button
                  className="icon-button"
                  onClick={onSearchPress}
                  type="button"
                >
                  <Search size={24} color="#fff" />
                </button>
              )}

              {showNotification && (
                <button
                  className="icon-button"
                  onClick={onNotificationPress}
                  type="button"
                >
                  <Bell size={24} color="#fff" />
                  {notificationCount > 0 && (
                    <div className="notification-badge">
                      <span className="notification-count">
                        {notificationCount > 99
                          ? "99+"
                          : notificationCount.toString()}
                      </span>
                    </div>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomHeader;
