import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { User, Lock, Bell, Palette, Globe } from "lucide-react";
import { teacherProfile } from "../../data/teacherData";

const sections = [
  { id: "profile",  label: "Teacher Profile",   icon: User },
  { id: "password", label: "Change Password",   icon: Lock },
  { id: "notify",   label: "Notification Settings", icon: Bell },
  { id: "theme",    label: "Theme",             icon: Palette },
  { id: "language", label: "Language",          icon: Globe },
];

export default function Settings() {
  const { setPageMeta } = useOutletContext();

  useEffect(() => {
    setPageMeta({ title: "Settings", subtitle: "Profile, security, and preferences" });
  }, [setPageMeta]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <aside className="bg-white rounded-xl border border-slate-200 p-3 h-fit">
        <ul className="space-y-1">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Icon size={16} className="text-slate-500" />
                  {s.label}
                </a>
              </li>
            );
          })}
        </ul>
      </aside>

      <div className="lg:col-span-2 space-y-6">
        {/* Profile */}
        <section id="profile" className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900">Teacher Profile</h3>
          <p className="text-sm text-slate-500 mt-0.5">Your name and email are visible to administrators.</p>

          <div className="flex items-center gap-4 mt-5">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white grid place-items-center font-bold text-lg">
              {teacherProfile.avatar}
            </div>
            <button className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm hover:bg-slate-50">
              Change Photo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            <Field label="Full Name" defaultValue={teacherProfile.name} />
            <Field label="Email"    defaultValue={teacherProfile.id} disabled />
            <Field label="Role"     defaultValue="Teacher" disabled />
            <Field label="School"   defaultValue={teacherProfile.school.name} disabled />
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm hover:bg-slate-50">Cancel</button>
            <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">Save Changes</button>
          </div>
        </section>

        {/* Password */}
        <section id="password" className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900">Change Password</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            <Field label="Current Password" type="password" />
            <Field label="New Password"     type="password" />
          </div>
          <p className="text-xs text-slate-500 mt-3">Min 8 chars, 1 uppercase, 1 number, 1 special character.</p>
          <div className="mt-5 flex justify-end">
            <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">Update Password</button>
          </div>
        </section>

        {/* Notifications */}
        <section id="notify" className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900">Notification Settings</h3>
          <ul className="mt-4 divide-y divide-slate-100">
            {[
              ["Email alerts when students are at risk",       true],
              ["Push notification for new assessments",         true],
              ["Weekly summary email",                          true],
              ["SMS for urgent announcements",                  false],
            ].map(([label, on]) => (
              <li key={label} className="flex items-center justify-between py-3">
                <span className="text-sm text-slate-700">{label}</span>
                <Toggle defaultOn={on} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Field({ label, type = "text", defaultValue = "", disabled = false }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        disabled={disabled}
        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm disabled:bg-slate-100 disabled:text-slate-500 outline-none focus:border-blue-500"
      />
    </div>
  );
}

function Toggle({ defaultOn }) {
  return (
    <button
      type="button"
      className={[
        "w-10 h-6 rounded-full p-0.5 transition",
        defaultOn ? "bg-blue-600" : "bg-slate-300",
      ].join(" ")}
    >
      <span className={[
        "block w-5 h-5 rounded-full bg-white shadow transition",
        defaultOn ? "translate-x-4" : "translate-x-0",
      ].join(" ")} />
    </button>
  );
}