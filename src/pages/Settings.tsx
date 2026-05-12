export default function Settings() {
  return (
    <div className="flex-1 p-margin-page overflow-y-auto overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-lg">
        <div>
          <h1 className="font-display text-display text-on-surface mb-1">Projira Settings</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Manage your workspace preferences and account details.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg max-w-[800px]">
        <div className="glass-panel rounded-xl p-lg flex flex-col gap-md bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <h2 className="font-h2 text-h2 text-on-surface mb-sm">Profile Details</h2>
          
          <div className="flex flex-col gap-sm">
            <label className="font-label-sm text-on-surface-variant">Full Name</label>
            <input type="text" defaultValue="İlker" className="w-full bg-surface-container border border-outline-variant rounded-lg p-sm text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors" />
          </div>

          <div className="flex flex-col gap-sm">
            <label className="font-label-sm text-on-surface-variant">Email Address</label>
            <input type="email" defaultValue="ilker@projira.app" className="w-full bg-surface-container border border-outline-variant rounded-lg p-sm text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors" />
          </div>

          <button className="mt-xs bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm px-md py-sm rounded-lg transition-colors w-fit border border-outline-variant">
            Update Profile
          </button>
        </div>

        <div className="glass-panel rounded-xl p-lg flex flex-col gap-md bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <h2 className="font-h2 text-h2 text-on-surface mb-sm">Preferences</h2>
          
          <div className="flex items-center justify-between py-xs border-b border-white/5">
            <div>
              <p className="font-body-md text-on-surface">Dark Mode</p>
              <p className="font-label-sm text-on-surface-variant">Toggle dark theme across the application</p>
            </div>
            <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
            </div>
          </div>

          <div className="flex items-center justify-between py-xs border-b border-white/5">
            <div>
              <p className="font-body-md text-on-surface">Email Notifications</p>
              <p className="font-label-sm text-on-surface-variant">Receive alerts for mentioned issues</p>
            </div>
            <div className="w-10 h-5 bg-surface-container-highest rounded-full relative cursor-pointer">
              <div className="w-4 h-4 bg-on-surface-variant rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
            </div>
          </div>

        </div>
        
        <div className="col-span-1 md:col-span-2 glass-panel rounded-xl p-lg flex flex-col gap-md bg-error/10 border border-error/20">
          <h2 className="font-h2 text-h2 text-error">Danger Zone</h2>
          <p className="font-body-md text-on-surface-variant">Once you delete your workspace, there is no going back. Please be certain.</p>
          <button className="bg-error/20 hover:bg-error/30 text-error font-label-sm px-md py-sm rounded-lg transition-colors w-fit border border-error/30">
            Delete Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
