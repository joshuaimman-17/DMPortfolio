import React, { useEffect, useMemo, useRef, useState } from 'react';

// Material Symbols names available in the site's icon font (curated for marketing / business / UI use).
export const ICON_NAMES: string[] = `
home search_check search travel_explore troubleshoot manage_search query_stats insights analytics monitoring bar_chart
show_chart trending_up trending_down pie_chart donut_large leaderboard stacked_line_chart finance percent payments
paid savings account_balance wallet credit_card receipt_long request_quote sell shopping_cart shopping_bag storefront
local_offer loyalty redeem campaign ads_click ad_group featured_video web_asset language public hub lan
call_split alt_route route fork_right merge hive schema account_tree device_hub target adjust track_changes
my_location flag emoji_events military_tech workspace_premium verified verified_user shield security lock key
fingerprint policy gavel handshake groups group person person_add diversity_3 support_agent badge contact_page
contact_mail contact_phone mail email forward_to_inbox mark_email_read drafts inbox send outgoing_mail
mark_email_unread unsubscribe chat forum comment sms question_answer record_voice_over mic podcasts call
phone_in_talk video_call videocam movie slideshow smart_display play_circle play_arrow smart_button
touch_app ads_click ads_click mouse web dashboard dashboard_customize space_dashboard grid_view view_quilt
view_module table_chart table_view list_alt checklist task task_alt fact_check assignment assignment_turned_in
rule done done_all check_circle verified bolt flash_on rocket rocket_launch speed timer schedule event
calendar_month today date_range update history pending hourglass_top alarm timeline waterfall_chart
candlestick_chart bubble_chart scatter_plot radar multiline_chart area_chart table_rows functions calculate
database storage dns cloud cloud_upload cloud_download cloud_sync backup sync autorenew cached refresh
settings tune build construction handyman engineering precision_manufacturing memory developer_board code
terminal data_object integration_instructions api webhook javascript css html data_array deployed_code
bug_report science biotech psychology psychology_alt lightbulb tips_and_updates auto_awesome auto_fix_high
magic_button smart_toy robot_2 neurology model_training lab_profile experiment quiz school menu_book
auto_stories book library_books bookmarks bookmark article newsmode newspaper feed rss_feed description
draft note sticky_note_2 edit edit_note border_color draw brush palette color_lens format_paint image
photo_camera photo_library collections gallery_thumbnail imagesmode filter_vintage camera_alt animation
design_services draw_collage style layers layers_clear crop aspect_ratio fit_screen zoom_in visibility
preview remove_red_eye share ios_share thumb_up favorite star grade rate_review reviews sentiment_satisfied
mood emoji_objects celebration cake local_fire_department whatshot trending_flat north_east arrow_outward
arrow_forward arrow_upward expand_more add add_circle remove close cancel info help error warning
notifications notification_important campaign_outlined push_pin location_on location_city map explore
near_me pin_drop place navigation directions local_shipping inventory inventory_2 package_2 deployed_code
warehouse factory apartment business corporate_fare domain work business_center cases work_history
store shop store_mall_directory restaurant local_cafe fitness_center spa health_and_safety medical_services
volunteer_activism diversity_1 diversity_2 eco energy_savings_leaf recycling solar_power water_drop
public_off translate g_translate travel flight directions_car commute two_wheeler pedal_bike
tag numbers alternate_email link add_link attach_file content_copy filter_alt sort filter_list tune
label new_label bookmark_added mood_bad sentiment_dissatisfied support help_center contact_support
live_help thumb_down visibility_off lock_open vpn_key password admin_panel_settings manage_accounts
account_circle face groups_2 people supervisor_account person_search social_leaderboard share_reviews
thumbs_up_down
`
  .split(/\s+/)
  .filter(Boolean)
  .filter((n, i, a) => a.indexOf(n) === i)
  .sort();

export const IconPicker: React.FC<{
  value: string;
  onChange: (v: string) => void;
  label?: string;
  labelClassName?: string;
  buttonClassName?: string;
}> = ({ value, onChange, label, labelClassName, buttonClassName }) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  const names = useMemo(() => {
    const list = value && !ICON_NAMES.includes(value) ? [value, ...ICON_NAMES] : ICON_NAMES;
    const s = q.trim().toLowerCase().replace(/\s+/g, '_');
    return s ? list.filter((n) => n.includes(s)) : list;
  }, [q, value]);

  return (
    <div className="flex flex-col gap-1" ref={ref}>
      {label && (
        <span className={labelClassName || 'text-[11px] font-bold uppercase tracking-wider text-neutral-500'}>{label}</span>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={
            buttonClassName ||
            'w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer text-left'
          }
        >
          <span className="material-symbols-outlined text-[20px] text-primary">{value || 'help'}</span>
          <span className="flex-1 truncate">{value || 'Select an icon'}</span>
          <span className="material-symbols-outlined text-[20px] text-neutral-500">expand_more</span>
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-[min(22rem,90vw)] bg-white border border-neutral-200 rounded-xl shadow-xl p-2">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Search ${ICON_NAMES.length} icons…`}
              className="w-full px-3 py-2 mb-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <div role="listbox" className="grid grid-cols-6 gap-1 max-h-60 overflow-y-auto">
              {names.map((n) => (
                <button
                  key={n}
                  type="button"
                  role="option"
                  aria-selected={n === value}
                  title={n}
                  onClick={() => {
                    onChange(n);
                    setOpen(false);
                    setQ('');
                  }}
                  className={`aspect-square flex items-center justify-center rounded-lg cursor-pointer hover:bg-neutral-100 ${
                    n === value ? 'bg-primary/10 text-primary ring-1 ring-primary/40' : 'text-neutral-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px]">{n}</span>
                </button>
              ))}
              {names.length === 0 && <p className="col-span-6 text-xs text-neutral-500 p-3 text-center">No icons match “{q}”.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
