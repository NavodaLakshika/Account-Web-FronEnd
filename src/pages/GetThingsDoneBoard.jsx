import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  ChevronDown,
  Plus,
  Loader2,
  ChevronRight,
  SlidersHorizontal,
  Eye,
  Info,
  BookOpen,
  Receipt,
  ShoppingCart,
  UserCircle2,
  FolderKanban,
  Package,
  Percent,
  Landmark,
  Search,
  ClipboardList,
  LayoutGrid,
  Bell,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Settings,
  EyeOff,
  Lock,
  GripVertical,
  Star,
  Gem,
  BarChart2,
  Shapes,
  PieChart,
  HelpCircle,
  Users,
  Play,
  PlayCircle,
} from 'lucide-react';
import { expensesService } from '../services/expenses.service';
import { biDashboardService } from '../services/biDashboard.service';
import { getSessionData } from '../utils/session';

const TABS = [
  { id: 'accounting', label: 'Accounting', icon: BookOpen, iconBg: '#2ca01c' },
  { id: 'expenses', label: 'Expenses & Pay Bills', icon: Receipt, iconBg: '#34d399' },
  { id: 'sales', label: 'Sales & Get Paid', icon: BarChart2, iconBg: '#10b981' },
  { id: 'customers', label: 'Customer Hub', icon: Shapes, iconBg: '#059669' },
  { id: 'team', label: 'Team', icon: UserCircle2, iconBg: '#60a5fa' },
  { id: 'projects', label: 'Projects', icon: FolderKanban, iconBg: '#3b82f6' },
  { id: 'inventory', label: 'Inventory', icon: Package, iconBg: '#60a5fa' },
  { id: 'tax', label: 'Tax', icon: PieChart, iconBg: '#f43f5e' },
  { id: 'marketing', label: 'Marketing', icon: Gem, iconBg: '#facc15' },
];

/** Primary row — matches QBO “Create actions” strip */
const DISPLAY_CREATE_ACTIONS = [
  { id: 'recurring_invoice', label: 'Create recurring invoice' },
  { id: 'invoice', label: 'Create invoice' },
  { id: 'journal', label: 'Create journal entry' },
  { id: 'record_expense', label: 'Record expense' },
  { id: 'make_deposit', label: 'Add bank deposit' },
  { id: 'enter_bill', label: 'Create bill' },
];

const TAB_EXTRA_ACTIONS = {
  accounting: [
    { id: 'trial_balance', label: 'View trial balance' },
    { id: 'bank_rec', label: 'Bank reconciliation' },
  ],
  expenses: [
    { id: 'pay_bill', label: 'Pay bills' },
    { id: 'write_cheque', label: 'Write cheque' },
    { id: 'expenses_detail', label: 'View expense details' },
  ],
  sales: [
    { id: 'sales_receipt', label: 'Create sales receipt' },
    { id: 'receive_payment', label: 'Receive payment' },
    { id: 'sales_order', label: 'Sales order' },
  ],
  customers: [
    { id: 'customer', label: 'Add customer' },
    { id: 'customer_advance', label: 'Customer advance' },
    { id: 'customer_receipt', label: 'Customer receipt' },
  ],
  team: [{ id: 'department', label: 'Manage departments' }],
  projects: [{ id: 'estimate', label: 'Create estimate' }],
  inventory: [
    { id: 'purchase_order', label: 'Purchase order' },
    { id: 'grn', label: 'GRN' },
    { id: 'items', label: 'Items & services' },
  ],
  tax: [{ id: 'reports', label: 'Tax reports' }],
};

const PLACEHOLDER_BANKS = [
  { name: 'Elite Client Account' },
  { name: 'M.E.S.A. Money Credit Card(Mobile Electro...' },
  { name: 'First Choice Community Credit Union (Niles,...' },
];

const formatLkr = (n) =>
  `LKR ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatShortK = (n) => {
  const v = Math.abs(Number(n) || 0);
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(Math.round(v));
};

const WIDGET_OPTIONS = [
  {
    group: 'Operational',
    items: [
      { id: 'app_carousel', label: 'App carousel' },
      { id: 'business_feed', label: 'Business feed' },
      { id: 'create_actions', label: 'Create actions' },
    ]
  },
  {
    group: 'Smart suggestions',
    icon: Sparkles,
    items: [
      { id: 'sales', label: 'Sales' },
      { id: 'accounts_receivable_smart', label: 'Accounts receivable' },
    ]
  },
  {
    group: 'All widgets',
    items: [
      { id: 'accounts_payable', label: 'Accounts payable' },
      { id: 'accounts_receivable', label: 'Accounts receivable' },
      { id: 'bank_accounts', label: 'Bank accounts' },
      { id: 'cash_flow', label: 'Cash flow' },
      { id: 'customers_funnel', label: 'Customers Funnel' },
      { id: 'expenses', label: 'Expenses' },
      { id: 'inventory_reports', label: 'Inventory Reports' },
      { id: 'invoices', label: 'Invoices' },
      { id: 'low_on_stock', label: 'Low on Stock' },
      { id: 'open_estimates', label: 'Open Estimates' },
      { id: 'sales_orders', label: 'Sales Orders' },
      { id: 'work_requests', label: 'Work Requests' },
      { id: 'reviews', label: 'Reviews' },
      { id: 'overdue_invoices', label: 'Overdue Invoices' },
      { id: 'referrals', label: 'Referrals' },
      { id: 'video_tutorials', label: 'Video tutorials' },
    ]
  }
];

const Checkbox = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer py-1.5">
    <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
    <div className={`w-[18px] h-[18px] rounded-[3px] border flex items-center justify-center shrink-0 transition-colors ${checked ? 'bg-[#0078d4] border-[#0078d4]' : 'bg-white border-[#d4d7dc] hover:border-[#8d9096]'}`}>
      {checked && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
    </div>
    <span className="text-[13px] text-[#393a3d]">{label}</span>
  </label>
);

const CREATE_ACTIONS_DB = {
  'Customers': [
    { id: 'create_invoice', label: 'Create invoice' },
    { id: 'create_estimate', label: 'Create estimate' },
    { id: 'record_payment', label: 'Record payment' },
    { id: 'create_sales_receipt', label: 'Create sales receipt' },
    { id: 'add_customer', label: 'Add customer' },
    { id: 'create_recurring_invoice', label: 'Create recurring invoice' },
    { id: 'recurring_sales_receipt', label: 'Recurring sales receipt' },
    { id: 'create_statement', label: 'Create statement' },
    { id: 'create_sales_order', label: 'Create sales order' },
  ],
  'Suppliers': [
    { id: 'record_expense', label: 'Record expense' },
    { id: 'create_bill', label: 'Create bill' },
    { id: 'pay_bills', label: 'Pay bills' },
    { id: 'add_supplier', label: 'Add supplier' },
    { id: 'create_purchase_order', label: 'Create purchase order' },
  ],
  'Other': [
    { id: 'add_bank_deposit', label: 'Add bank deposit' },
    { id: 'create_journal_entry', label: 'Create journal entry' },
    { id: 'transfer_funds', label: 'Transfer funds' },
  ]
};

const ALL_ACTIONS_MAP = {};
Object.values(CREATE_ACTIONS_DB).flat().forEach(a => {
  ALL_ACTIONS_MAP[a.id] = a;
});

const ShowAllActionsPanel = ({ isOpen, onClose, favActions, onSave }) => {
  const [selected, setSelected] = useState(favActions);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelected(favActions);
      setSearch('');
    }
  }, [isOpen, favActions]);

  if (!isOpen) return null;

  const toggle = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(x => x !== id));
    } else {
      if (selected.length < 10) setSelected([...selected, id]);
    }
  };

  const hasChanges = JSON.stringify(selected) !== JSON.stringify(favActions);

  const filteredDB = Object.entries(CREATE_ACTIONS_DB).reduce((acc, [group, items]) => {
    const fItems = items.filter(i => i.label.toLowerCase().includes(search.toLowerCase()));
    if (fItems.length > 0) acc[group] = fItems;
    return acc;
  }, {});

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[10000] backdrop-blur-[1px]" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-[360px] bg-white z-[10001] shadow-2xl flex flex-col font-['Plus_Jakarta_Sans'] animate-in slide-in-from-right duration-300">
        <div className="h-14 flex items-center justify-center border-b border-[#eceef1] relative shrink-0">
          <h2 className="text-[15px] font-bold text-[#393a3d]">Create actions</h2>
          <button onClick={onClose} className="absolute right-4 p-2 text-[#6b6c72] hover:bg-[#f4f5f8] rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8d9096]" />
            <input 
              type="text" 
              placeholder="Search all Create actions"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-8 rounded border border-[#d4d7dc] text-[13px] focus:outline-none focus:border-[#0078d4]"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8d9096]">
                <X size={14} />
              </button>
            )}
          </div>
          <p className="text-[12px] text-[#393a3d] mb-2 leading-relaxed">
            Choose your favourites. If you don't customise, your top actions will change as we learn more about you.
          </p>
          <p className="text-[12px] text-[#393a3d] mb-6">Select up to 10:</p>

          {!search && selected.length > 0 && (
            <div className="mb-8">
              <h4 className="text-[12px] font-bold text-[#393a3d] mb-3">Favourites</h4>
              <div className="space-y-0.5">
                {selected.map(id => {
                  const item = ALL_ACTIONS_MAP[id];
                  if (!item) return null;
                  return (
                    <div key={id} className="flex items-center gap-3 py-1.5 hover:bg-[#f4f5f8] rounded group cursor-grab">
                      <GripVertical size={14} className="text-[#8d9096] ml-1" />
                      <button onClick={() => toggle(id)} className="shrink-0 flex items-center justify-center">
                        <Star size={18} fill="#0078d4" className="text-[#0078d4]" />
                      </button>
                      <span className="text-[13px] text-[#393a3d]">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {Object.entries(filteredDB).map(([group, items]) => (
            <div key={group} className="mb-6">
              <h4 className="text-[12px] font-bold text-[#393a3d] mb-3">{group}</h4>
              <div className="space-y-2">
                {items.map(item => {
                  const isFav = selected.includes(item.id);
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <button onClick={() => toggle(item.id)} className="shrink-0 flex items-center justify-center">
                        {isFav ? (
                          <Star size={18} fill="#0078d4" className="text-[#0078d4]" />
                        ) : (
                          <Star size={18} className="text-[#8d9096]" />
                        )}
                      </button>
                      <span className="text-[13px] text-[#393a3d]">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-[#f4f5f8] p-4 flex items-center justify-between shrink-0">
          <button onClick={onClose} className="text-[14px] font-bold text-[#2ca01c] hover:underline px-4 py-2">
            Cancel
          </button>
          <button 
            disabled={!hasChanges}
            onClick={() => {
              onSave(selected);
              onClose();
            }} 
            className={`font-bold text-[14px] px-6 py-2 rounded-md shadow-sm transition-colors ${
              hasChanges 
                ? 'bg-[#2ca01c] hover:bg-[#207a15] text-white' 
                : 'bg-[#8dc790] text-white cursor-not-allowed'
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
};

const TUTORIAL_VIDEOS = [
  {
    id: 'get_started',
    title: 'Getting started with ONIMTA Accounts',
    url: 'https://www.youtube.com/embed/S2pE8-VbF-I',
    thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80',
    duration: '3:45'
  },
  {
    id: 'track_expenses',
    title: 'How to track your expenses efficiently',
    url: 'https://www.youtube.com/embed/S2pE8-VbF-I',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80',
    duration: '5:20'
  },
  {
    id: 'manage_invoices',
    title: 'Managing invoices and payments',
    url: 'https://www.youtube.com/embed/S2pE8-VbF-I',
    thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80',
    duration: '4:15'
  },
  {
    id: 'bank_rec',
    title: 'Bank reconciliation basics',
    url: 'https://www.youtube.com/embed/S2pE8-VbF-I',
    thumbnail: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=400&q=80',
    duration: '6:30'
  },
  {
    id: 'profit_loss',
    title: 'Understanding the Profit & Loss report',
    url: 'https://www.youtube.com/embed/S2pE8-VbF-I',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80',
    duration: '8:05'
  }
];

const VideoTutorialsModal = ({ isOpen, initialVideoId, onClose }) => {
  const [activeId, setActiveId] = useState(initialVideoId || 'get_started');

  useEffect(() => {
    if (isOpen) {
      setActiveId(initialVideoId || 'get_started');
    }
  }, [isOpen, initialVideoId]);

  if (!isOpen) return null;

  const activeVideo = TUTORIAL_VIDEOS.find(v => v.id === activeId) || TUTORIAL_VIDEOS[0];

  return (
    <div className="fixed inset-0 z-[10005] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/70 hover:text-white transition-colors z-20 bg-black/40 hover:bg-black/80 rounded-full p-2"
      >
        <X size={24} />
      </button>

      <div className="relative w-full max-w-5xl bg-[#111827] rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/10 flex flex-col md:flex-row h-[85vh] max-h-[700px]">
        {/* Left: Player */}
        <div className="flex-1 bg-black flex flex-col relative min-h-0">
          <div className="flex-1 w-full h-full min-h-0">
            <iframe 
              src={`${activeVideo.url}?autoplay=1`} 
              className="w-full h-full border-0" 
              allow="autoplay; encrypted-media" 
              allowFullScreen 
            />
          </div>
          <div className="p-4 sm:p-6 bg-[#1f2937] shrink-0 border-t border-white/10">
            <h2 className="text-lg sm:text-xl font-bold text-white">{activeVideo.title}</h2>
          </div>
        </div>

        {/* Right: Playlist */}
        <div className="w-full md:w-[320px] lg:w-[360px] bg-[#111827] flex flex-col border-l border-white/10 shrink-0 h-[250px] md:h-auto">
          <div className="p-4 sm:p-5 border-b border-white/10 shrink-0">
            <h3 className="text-[15px] sm:text-[17px] font-bold text-white">More tutorials</h3>
            <p className="text-[12px] sm:text-[13px] text-white/60 mt-0.5">{TUTORIAL_VIDEOS.length} videos available</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1 sm:space-y-2 no-scrollbar">
            {TUTORIAL_VIDEOS.map(video => {
              const isActive = video.id === activeId;
              return (
                <button
                  key={video.id}
                  onClick={() => setActiveId(video.id)}
                  className={`w-full flex items-start gap-3 p-2 rounded-lg text-left transition-colors ${
                    isActive ? 'bg-[#374151]' : 'hover:bg-[#1f2937]'
                  }`}
                >
                  <div className="relative w-24 sm:w-28 aspect-video bg-black rounded shrink-0 overflow-hidden">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-1 rounded font-medium">
                      {video.duration}
                    </div>
                    {isActive && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Play size={16} fill="white" className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <h4 className={`text-[12px] font-semibold leading-snug line-clamp-2 ${isActive ? 'text-white' : 'text-white/80'}`}>
                      {video.title}
                    </h4>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const AddWidgetsPanel = ({ isOpen, onClose, initialSelected, onSave }) => {
  const [selected, setSelected] = useState(initialSelected);

  useEffect(() => {
    if (isOpen) setSelected(initialSelected);
  }, [isOpen, initialSelected]);

  if (!isOpen) return null;

  const toggle = (id) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const hasChanges = JSON.stringify(selected) !== JSON.stringify(initialSelected);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[10000] backdrop-blur-[1px]" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-[360px] bg-white z-[10001] shadow-2xl flex flex-col font-['Plus_Jakarta_Sans'] animate-in slide-in-from-right duration-300">
        <div className="h-14 flex items-center justify-center border-b border-[#eceef1] relative shrink-0">
          <h2 className="text-[15px] font-bold text-[#393a3d]">Add widgets</h2>
          <button onClick={onClose} className="absolute right-4 p-2 text-[#6b6c72] hover:bg-[#f4f5f8] rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          <h3 className="text-[17px] font-bold text-[#393a3d] mb-6 tracking-tight">Select widgets for your dashboard</h3>
          <div className="space-y-5">
            {WIDGET_OPTIONS.map((group, idx) => (
              <div key={idx}>
                {idx > 0 && <div className="border-t border-[#eceef1] my-4" />}
                <div className="flex items-center gap-1.5 mb-3">
                  {group.icon && <group.icon size={13} className="text-[#393a3d]" strokeWidth={2.5} />}
                  <h4 className="text-[12px] font-bold text-[#393a3d] tracking-wide">{group.group}</h4>
                </div>
                <div className="space-y-1">
                  {group.items.map(item => (
                    <Checkbox
                      key={item.id}
                      checked={!!selected[item.id]}
                      onChange={() => toggle(item.id)}
                      label={item.label}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#f4f5f8] p-4 flex items-center justify-between shrink-0">
          <button onClick={onClose} className="text-[14px] font-bold text-[#2ca01c] hover:underline px-4 py-2">
            Cancel
          </button>
          <button 
            disabled={!hasChanges}
            onClick={() => {
              onSave(selected);
              onClose();
            }} 
            className={`font-bold text-[14px] px-6 py-2 rounded-md shadow-sm transition-colors ${
              hasChanges 
                ? 'bg-[#2ca01c] hover:bg-[#207a15] text-white' 
                : 'bg-[#8dc790] text-white cursor-not-allowed'
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
};

const EditWrapper = ({ children, isEditing, grabbers = [], className = '', onRemove }) => {
  if (!isEditing) return <div className={className}>{children}</div>;
  return (
    <div className={`group relative rounded-2xl ring-[1.5px] ring-blue-500 z-10 transition-all ${className} hover:ring-2 hover:shadow-xl`}>
      {grabbers.includes('left') && <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-blue-500 z-20 cursor-move" title="Change place" />}
      {grabbers.includes('right') && <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-blue-500 z-20 cursor-move" title="Change place" />}
      {grabbers.includes('top') && <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-blue-500 z-20 cursor-move" title="Change place" />}
      {grabbers.includes('bottom') && <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-blue-500 z-20 cursor-move" title="Change place" />}
      
      {onRemove && (
        <button 
          onClick={onRemove}
          className="absolute -top-3 -right-3 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-rose-500 shadow-md hover:bg-rose-550 hover:text-white hover:border-rose-550 transition-colors z-30 opacity-0 group-hover:opacity-100"
          title="Delete widget"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      )}

      {onRemove && (
        <div 
          className="absolute bottom-[-2px] right-[-2px] w-4 h-4 cursor-se-resize z-30 opacity-0 group-hover:opacity-100 flex items-end justify-end p-0.5"
          title="Change size"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#2ca01c" strokeWidth="1.5">
            <path d="M9 1L9 9L1 9" />
          </svg>
        </div>
      )}

      <div className="opacity-45 pointer-events-none select-none transition-opacity h-full">
        {children}
      </div>
    </div>
  );
};

/** QBO-style widget: white card + optional full-width footer button */
const WidgetShell = ({ title, subtitle, children, footerButtonLabel, onFooterButton, onHide }) => (
  <div className="group relative bg-white border border-slate-200/60 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02),0_1px_3px_rgba(0,0,0,0.01)] flex flex-col min-h-[200px] h-full hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.06)] hover:border-slate-350/80 transition-all duration-300 ease-out">
    <div className="p-4 sm:p-4.5 flex-1 flex flex-col min-h-0 relative">
      <div className="flex justify-between items-start gap-2 mb-1">
        <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-slate-400">
          {title}
        </span>
        {onHide ? (
          <button 
            onClick={onHide} 
            className="text-[11.5px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 sm:right-5 top-4 sm:top-5 bg-white z-10 hover:text-blue-800"
          >
            Hide
          </button>
        ) : (
          <ChevronDown size={13} className="text-slate-400 shrink-0 mt-0.5" />
        )}
      </div>
      {subtitle && <p className="text-[13.5px] font-extrabold text-slate-800 leading-snug tracking-tight">{subtitle}</p>}
      <div className="flex-1 min-h-0 mt-1.5 overflow-hidden">{children}</div>
    </div>
    {footerButtonLabel && (
      <div className="px-3 pb-3 pt-0 shrink-0">
        <button
          type="button"
          onClick={onFooterButton}
          className="w-full h-8 rounded-xl border border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-650 hover:bg-slate-100 hover:text-slate-805 hover:border-slate-200 transition-all"
        >
          {footerButtonLabel}
        </button>
      </div>
    )}
  </div>
);

const HeaderIconBtn = ({ children, label, onClick }) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    onClick={onClick}
    className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 active:scale-95 transition-all shrink-0"
  >
    {children}
  </button>
);

const GetThingsDoneBoard = ({ isOpen, onClose, user, selectedCompany, onAction, isInline = false }) => {
  const [activeTab, setActiveTab] = useState('expenses');
  const [isCustomising, setIsCustomising] = useState(false);
  const [isAddWidgetsOpen, setIsAddWidgetsOpen] = useState(false);
  const [bankPage, setBankPage] = useState(0);
  const [selectedWidgets, setSelectedWidgets] = useState(() => {
    const saved = localStorage.getItem('onimta_gtd_widgets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      'app_carousel': true,
      'business_feed': true,
      'create_actions': true,
      'bank_accounts': true,
      'cash_flow': true,
      'expenses': true,
      'profit_and_loss': true,
      'add_widgets': true,
      'inventory_reports': true,
      'low_on_stock': true,
      'invoices': true,
      'customers_funnel': true,
      'sales': true,
      'accounts_payable': true,
      'accounts_receivable': true,
      'sales_orders': true,
      'work_requests': true,
      'reviews': true,
      'overdue_invoices': true,
      'referrals': true,
      'video_tutorials': true,
    };
  });
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [isShowAllActionsOpen, setIsShowAllActionsOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(null);
  const [widgetToHide, setWidgetToHide] = useState(null);
  const [favActions, setFavActions] = useState(() => {
    const saved = localStorage.getItem('onimta_gtd_fav_actions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      'create_recurring_invoice',
      'create_invoice',
      'create_journal_entry',
      'record_expense',
      'add_bank_deposit',
      'create_bill',
    ];
  });
  const [loading, setLoading] = useState(false);
  const [totalIncome, setTotalIncome] = useState(0);
  const [expenseData, setExpenseData] = useState({
    totalExpenses: 0,
    unpaidBills: 0,
    overdueBills: 0,
    categoryBreakdown: [],
    recentTransactions: [],
  });
  const [biData, setBiData] = useState(null);
  const tabScrollRef = useRef(null);

  // Persist preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('onimta_gtd_widgets', JSON.stringify(selectedWidgets));
  }, [selectedWidgets]);

  useEffect(() => {
    localStorage.setItem('onimta_gtd_fav_actions', JSON.stringify(favActions));
  }, [favActions]);

  const { companyCode } = getSessionData();
  const accent = '#0078d4';

  const companyName =
    selectedCompany?.CompanyName ||
    selectedCompany?.companyName ||
    'ONIMTA IT SOLUTIONS';

  const userName =
    user?.Full_Name || user?.fullName || user?.empName || user?.EmpName || 'User';

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  useEffect(() => {
    if (!isOpen || !companyCode) return;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await biDashboardService.getSummary(companyCode);

        // Build expenseData from biData for backward compat
        const expenseRes = {
          totalExpenses: data.totalExpenses || 0,
          unpaidBills: data.unpaidBills || 0,
          overdueBills: data.overdueBills || 0,
          categoryBreakdown: data.categoryBreakdown || [],
          recentTransactions: data.recentTransactions || [],
        };

        if (!cancelled) {
          setBiData(data);
          setExpenseData(expenseRes);
          setTotalIncome(data.totalIncome || 0);
        }
      } catch {
        if (!cancelled) {
          setBiData(null);
          setExpenseData({
            totalExpenses: 0,
            unpaidBills: 0,
            overdueBills: 0,
            categoryBreakdown: [],
            recentTransactions: [],
          });
          setTotalIncome(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [isOpen, companyCode]);

  const scrollTabs = (dir) => {
    const el = tabScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 200, behavior: 'smooth' });
  };

  if (!isOpen) return null;

  const totalSpend = expenseData.totalExpenses || 0;
  const categories = expenseData.categoryBreakdown || [];

  // Compute monthly expense totals from real transactions for Cash Flow
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyExpenses = Array(12).fill(0);
  (expenseData.recentTransactions || []).forEach(tx => {
    const d = new Date(tx.date);
    if (!isNaN(d)) {
      monthlyExpenses[d.getMonth()] += Number(tx.total || 0);
    }
  });
  const maxMonthly = Math.max(...monthlyExpenses, 1);
  const monthlyData = MONTHS.map((m, i) => ({
    m,
    h1: Math.max(4, Math.round((monthlyExpenses[i] / maxMonthly) * 100)),
    h2: Math.max(2, Math.round((monthlyExpenses[i] / maxMonthly) * 90)),
    hasData: monthlyExpenses[i] > 0,
  }));
  const cashFlowMax = maxMonthly;

  const runAction = (id) => {
    if (!onAction) return;
    if (id === 'recurring_invoice') {
      onAction('invoice');
      return;
    }
    onAction(id);
  };

  const userInitial = (userName || 'U').trim().charAt(0).toUpperCase() || 'U';
  const companyNameUpper = (companyName || '').toUpperCase();

  const bringInTransactions = () => runAction('bank_rec');

  const topActions = activeTab === 'accounting' ? favActions.map(id => ALL_ACTIONS_MAP[id]).filter(Boolean) : (TAB_EXTRA_ACTIONS[activeTab] || []);

  return (
    <div className={`${isInline ? 'relative w-full h-full' : 'fixed inset-0 z-[9999]'} flex flex-col font-['Plus_Jakarta_Sans'] text-slate-700 bg-[#f8fafc] overflow-hidden animate-in fade-in duration-300`}>
      {/* QBO-style top header */}
        <header className="shrink-0 bg-white/95 border-b border-slate-200/60 px-4 sm:px-5 lg:px-7 py-3">
          <div className="flex items-center gap-2 lg:gap-4 min-h-[44px]">
            {/* Left: brand + company */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0 max-w-[40%] sm:max-w-none">
              <div className="flex items-center gap-2 shrink-0">
              <img
                src="/onimta_logo-modified.png"
                alt=""
                className="h-7 w-auto object-contain shrink-0 hidden md:block opacity-90"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
                <div className="leading-[1.05] hidden sm:block">
                  <div className="text-[9px] font-bold text-slate-800 tracking-[0.12em] uppercase">
                    ONIMTA
                  </div>
                  <div className="text-[11px] font-extrabold text-slate-950 tracking-tight">Accounts</div>
                </div>
              </div>
              <div className="h-6 w-px bg-slate-200 shrink-0 hidden sm:block" aria-hidden />
            
              <span
                className="text-[11.5px] sm:text-[13px] font-extrabold text-slate-800 uppercase tracking-wider truncate min-w-0"
                title={companyName}
              >
                {companyNameUpper}
              </span>
            </div>

            {/* Center: global search */}
            <div className="flex-1 flex justify-center min-w-0 px-1 sm:px-2">
              <button
                type="button"
                onClick={() => runAction('header_search')}
                className="w-full max-w-[620px] flex items-center gap-2.5 h-9 px-4 rounded-full bg-slate-100/60 border border-slate-200/50 hover:bg-slate-100 hover:border-slate-300 text-left transition-all duration-200 focus:outline-none"
              >
                <Search size={15} className="text-slate-500 shrink-0" strokeWidth={2.5} />
                <span className="text-[12.5px] text-slate-400 truncate">
                  Search transactions, settings, and help...
                </span>
              </button>
            </div>

            {/* Right: utilities + close */}
            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
              <HeaderIconBtn label="Tasks" onClick={() => runAction('header_tasks')}>
                <ClipboardList size={18} strokeWidth={2} className="text-slate-650" />
              </HeaderIconBtn>
              <HeaderIconBtn label="Quick menu" onClick={() => runAction('header_apps')}>
                <LayoutGrid size={18} strokeWidth={2} className="text-slate-650" />
              </HeaderIconBtn>
              <HeaderIconBtn label="Notifications" onClick={() => runAction('header_notifications')}>
                <Bell size={18} strokeWidth={2} className="text-slate-650" />
              </HeaderIconBtn>
              <HeaderIconBtn label="Settings" onClick={() => runAction('header_settings')}>
                <Settings size={18} strokeWidth={2} className="text-slate-650" />
              </HeaderIconBtn>
              <HeaderIconBtn label="Help" onClick={() => runAction('header_help')}>
                <HelpCircle size={18} strokeWidth={2} className="text-slate-650" />
              </HeaderIconBtn>
              <HeaderIconBtn label="Your profile" onClick={() => runAction('header_profile')}>
                <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 text-white text-[12px] font-bold flex items-center justify-center shadow-sm ring-2 ring-blue-100">
                  {userInitial}
                </span>
              </HeaderIconBtn>
              <HeaderIconBtn label="Assistant" onClick={() => runAction('header_ai')}>
                <Sparkles size={18} strokeWidth={2} className="text-blue-600" />
              </HeaderIconBtn>
            </div>
          </div>
        </header>

        {/* Body (no duplicate slim chrome) */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <div className="w-full max-w-[min(2050px,100%)] mx-auto px-2.5 sm:px-5 lg:px-7 pb-4">
            {/* Greeting + utilities */}
            <div className="relative pt-3 sm:pt-4.5 pb-2.5">
              <div className="absolute right-0 top-3 sm:top-4.5 flex items-center gap-3 sm:gap-4 text-[12px] sm:text-[13px] font-bold text-slate-605">
                {isCustomising ? (
                  <>
                    <button className="text-blue-650 hover:underline transition-colors hidden sm:block">
                      Learn how to customise your layout
                    </button>
                    <button 
                      onClick={() => setIsAddWidgetsOpen(true)}
                      className="border border-[#2ca01c] text-[#2ca01c] px-3 py-1.5 rounded hover:bg-[#f4f5f8] transition-colors"
                    >
                      Add or remove widgets
                    </button>
                    <button 
                      onClick={() => setIsCustomising(false)}
                      className="bg-[#2ca01c] text-white px-4 py-1.5 rounded hover:bg-[#207a15] transition-colors"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                      onClick={() => setVideoOpen('get_started')}
                    >
                      <PlayCircle size={15} className="text-slate-400" />
                      <span className="hidden sm:inline">Video tutorials</span>
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                      onClick={() => setIsCustomising(true)}
                    >
                      <SlidersHorizontal size={15} className="text-slate-400" />
                      <span className="hidden sm:inline">Customise</span>
                    </button>
                    <div className="relative group flex items-center">
                      <button 
                        type="button" 
                        onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                        className={`flex items-center gap-1.5 transition-colors ${isPrivacyMode ? 'text-slate-800' : 'hover:text-blue-600'}`}
                      >
                        {isPrivacyMode ? <EyeOff size={15} className="text-slate-400" /> : <Eye size={15} className="text-slate-400" />}
                        <span className="hidden sm:inline">Privacy</span>
                      </button>
                      
                      {isPrivacyMode && (
                        <div className="absolute top-full right-0 mt-3 w-[220px] bg-[#8d9096] text-white text-[12px] p-4 rounded shadow-lg z-50">
                          <div className="absolute -top-1.5 right-6 w-3 h-3 bg-[#8d9096] rotate-45" />
                          <div className="relative z-10 leading-snug">
                            Show the financial info on your dashboard.
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <h1 className="text-center text-[22px] sm:text-[26px] lg:text-[30px] font-extralight text-slate-800 tracking-tight px-8 sm:px-0">
                {greeting}, <span className="font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900">{userName}!</span>
              </h1>
              <p className="text-center text-slate-500 text-[12px] mt-0.5 font-medium">Here's what's happening with your business today.</p>
            </div>

            {/* Dark category pills + scroll */}
            <EditWrapper isEditing={isCustomising} className="mb-3.5 py-1 px-1">
              <div className="flex items-center justify-center gap-1 sm:gap-2 w-full">
                <div
                  ref={tabScrollRef}
                  className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 max-w-full min-w-0"
                >
                  {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`shrink-0 flex items-center gap-3 pl-1.5 pr-5 h-11 rounded-full text-left transition-all border duration-200 ${
                          isActive
                            ? 'bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/10'
                            : 'bg-white border-slate-200/80 hover:border-slate-350 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span
                          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors"
                          style={{
                            backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : `${tab.iconBg}18`,
                            color: isActive ? '#ffffff' : tab.iconBg,
                          }}
                        >
                          <Icon size={15} strokeWidth={2.5} />
                        </span>
                        <span className={`text-[13.5px] font-semibold whitespace-nowrap ${isActive ? 'text-white' : 'text-slate-700'}`}>
                          {tab.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </EditWrapper>

            {/* Create actions */}
            {selectedWidgets.create_actions && (
              <EditWrapper isEditing={isCustomising} className="mb-4 py-2 px-1">
                <div className="flex flex-col items-center justify-center gap-3 bg-slate-50 border border-slate-200/50 p-4 rounded-2xl max-w-4xl mx-auto shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Create Actions</span>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {DISPLAY_CREATE_ACTIONS.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => runAction(a.id)}
                        className="px-4 py-1 h-9 rounded-full text-[13px] font-semibold text-slate-700 bg-white border border-slate-200/80 hover:border-slate-450 hover:text-slate-950 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] active:scale-97 transition-all whitespace-nowrap"
                      >
                        {a.label}
                      </button>
                    ))}
                    {topActions.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => runAction(a.id)}
                        className="px-4 py-1 h-9 rounded-full text-[13px] font-semibold text-slate-700 bg-white border border-slate-200/80 hover:border-slate-450 hover:text-slate-950 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] active:scale-97 transition-all whitespace-nowrap"
                      >
                        {a.label}
                      </button>
                    ))}
                    {activeTab === 'accounting' && (
                      <button
                        type="button"
                        onClick={() => setIsShowAllActionsOpen(true)}
                        className="text-[13px] font-bold text-blue-650 hover:text-blue-800 transition-colors ml-2 mr-3"
                      >
                        Show all
                      </button>
                    )}
                  </div>
                </div>
              </EditWrapper>
            )}

            <div className="border-b border-slate-200 pb-1.5 mb-3 flex items-center justify-between">
              <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                Business at a glance
              </h2>
            </div>

            {isCustomising && (
              <div className="bg-[#eceef1] rounded-md py-3 px-4 mb-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <span className="text-[12px] font-bold text-[#393a3d]">Are these customisation options useful?</span>
                <div className="flex gap-1.5">
                  <button className="w-8 h-8 rounded-full border border-[#d4d7dc] bg-white flex items-center justify-center hover:bg-[#f4f5f8] text-[#393a3d] transition-colors">
                    <ThumbsUp size={14} />
                  </button>
                  <button className="w-8 h-8 rounded-full border border-[#d4d7dc] bg-white flex items-center justify-center hover:bg-[#f4f5f8] text-[#393a3d] transition-colors">
                    <ThumbsDown size={14} />
                  </button>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center gap-2 py-4 text-[#6b6c72] mb-2">
                <Loader2 size={18} className="animate-spin text-[#0078d4]" />
                <span className="text-[13px] font-semibold">Loading your data…</span>
              </div>
            )}

            {isPrivacyMode ? (
              <div className="relative mt-6 min-h-[500px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-8 gap-y-16 mb-4 pointer-events-none px-4">
                  {[1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} className="h-[120px] flex flex-col pt-2">
                      <div className="w-28 h-3 bg-[#e5e7eb] rounded-sm mb-5" />
                      <div className="w-40 h-3 bg-[#e5e7eb] rounded-sm" />
                    </div>
                  ))}
                </div>
                
                <div className="absolute top-[180px] left-1/2 -translate-x-1/2 border border-[#d4d7dc] rounded shadow-md bg-white py-5 px-6 flex items-center justify-center gap-3 min-w-[340px]">
                  <Lock size={20} className="text-[#393a3d]" strokeWidth={2.5} />
                  <span className="text-[13px] text-[#393a3d]">See your financial info by turning privacy off.</span>
                </div>
              </div>
            ) : (
              <>
                {/* 4-column widget row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
              {/* Profit & Loss */}
              {selectedWidgets.profit_and_loss && (
                <EditWrapper 
                  isEditing={isCustomising} 
                  grabbers={['left', 'right']}
                  onRemove={() => setSelectedWidgets(prev => ({...prev, profit_and_loss: false}))}
                >
                  <WidgetShell
                    title="Profit & Loss"
                    subtitle="See what you make & spend across all your accounts"
                    footerButtonLabel="Bring in transactions automatically"
                    onFooterButton={bringInTransactions}
                    onHide={() => setWidgetToHide('profit_and_loss')}
                  >
                  <div className="flex flex-col justify-center h-full gap-4.5 py-1 mt-1">
                    {[
                      { label: 'Income', val: totalIncome, gradient: 'from-green-500 to-emerald-600' },
                      { label: 'Expenses', val: totalSpend, gradient: 'from-sky-500 to-cyan-550' },
                    ].map((bar, idx) => {
                      const max = Math.max(totalIncome, totalSpend, 1);
                      const hasData = bar.val > 0;
                      const wPct = hasData ? Math.max(10, Math.round((bar.val / max) * 100)) : 0;
                      return (
                        <div key={idx} className="flex flex-col gap-1">
                          <div className="text-[15px] font-extrabold text-slate-800">
                            {formatLkr(bar.val).replace('LKR', 'LKR ')}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-[12px] font-semibold text-slate-500 w-[60px] shrink-0">{bar.label}</div>
                            <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
                              {hasData ? (
                                <div 
                                  className={`h-full transition-all duration-1000 ease-out rounded-full bg-gradient-to-r ${bar.gradient}`}
                                  style={{ width: `${wPct}%` }}
                                />
                              ) : (
                                <div className="h-full w-2 bg-slate-200 rounded-full" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </WidgetShell>
                </EditWrapper>
              )}

              {/* Expenses */}
              {selectedWidgets.expenses && (
                <EditWrapper 
                  isEditing={isCustomising} 
                  grabbers={['left', 'right']}
                  onRemove={() => setSelectedWidgets(prev => ({...prev, expenses: false}))}
                >
                  <WidgetShell
                    title="Expenses"
                    subtitle="See where your money is going"
                    footerButtonLabel="Bring in transactions automatically"
                    onFooterButton={bringInTransactions}
                    onHide={() => setWidgetToHide('expenses')}
                  >
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 min-h-[120px] mt-2">
                    {categories.length === 0 ? (
                      <>
                        <div className="relative w-[110px] h-[110px] shrink-0">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <circle cx="50" cy="50" r="38" fill="none" stroke="#e5e7eb" strokeWidth="24" />
                          </svg>
                        </div>
                        <div className="flex-1 space-y-3 w-full max-w-[100px]">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-2">     
                              <div className="w-2.5 h-2.5 rounded-full bg-[#e5e7eb] shrink-0" />
                              <div className="h-2 w-16 rounded bg-[#e5e7eb]" />
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className="relative w-[110px] h-[110px] shrink-0 rounded-full"
                          style={{
                            background: `conic-gradient(${categories
                              .slice(0, 5)
                              .reduce(
                                (acc, cat, i) => {
                                  const colors = ['#3478c1', '#39a29e', '#68358e', '#b4190c', '#e86016'];
                                  const start = acc.offset;
                                  const pct = Math.min(100, Math.max(0, Number(cat.percentage) || 0));
                                  acc.offset += pct;
                                  acc.parts.push(
                                    `${colors[i % 5]} ${start}% ${acc.offset}%`
                                  );
                                  return acc;
                                },
                                { parts: [], offset: 0 }
                              )
                              .parts.join(', ')})`,
                          }}
                        >
                          <div className="absolute inset-[18px] rounded-full bg-white" />
                        </div>
                        <div className="flex-1 space-y-2.5 w-full max-w-[160px] text-[12px]">
                          {categories.slice(0, 5).map((cat, i) => {
                            const name = cat.categoryName || cat.CategoryName || cat.name || cat.Name || '';
                            return (
                              <div key={i} className="flex items-center gap-2">
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{
                                    backgroundColor: ['#3478c1', '#39a29e', '#68358e', '#b4190c', '#e86016'][i % 5],
                                  }}
                                />
                                <span className="truncate flex-1 text-slate-650 font-bold text-[12px]">
                                  {name || 'Category name'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </WidgetShell>
                </EditWrapper>
              )}

              {/* Add widgets */}
              {selectedWidgets.add_widgets && (
                <EditWrapper 
                  isEditing={isCustomising} 
                  grabbers={['left', 'right']} 
                  className="h-full"
                  onRemove={() => setSelectedWidgets(prev => ({...prev, add_widgets: false}))}
                >
                  <div className="bg-white border border-dashed border-[#babec5] rounded-lg min-h-[240px] flex flex-col h-full overflow-hidden">
                    {/* Top: Add widgets */}
                    <div className="flex flex-col items-center justify-center pt-6 pb-5 px-5 mt-2">
                      <span className="text-[14px] font-bold text-[#393a3d] mb-3">Add widgets</span>
                      <button
                        type="button"
                        onClick={() => setIsAddWidgetsOpen(true)}
                        className="w-9 h-9 rounded-full border border-[#d4d7dc] bg-white flex items-center justify-center text-[#6b6c72] hover:border-[#0078d4] hover:text-[#0078d4] transition-all shadow-sm"
                      >
                        <Plus size={18} strokeWidth={1.8} />
                      </button>
                    </div>
                    {/* Divider */}
                    <div className="w-full h-px bg-[#eceef1] mt-2" />
                <div className="text-center flex-1 flex flex-col items-center mt-5">
                  <p className="text-[11px] font-bold text-[#393a3d] mb-3 flex items-center justify-center gap-1.5">
                    <Sparkles size={12} className="text-[#6b6c72]" /> Smart suggestions
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('sales');
                        runAction('invoice');
                      }}
                      className="px-4 py-1.5 rounded-full border border-[#d4d7dc] bg-white text-[11px] font-bold text-[#393a3d] hover:bg-[#f4f5f8]"
                    >
                      Sales
                    </button>
                    <button
                      type="button"
                      onClick={() => runAction('receive_payment')}
                      className="px-4 py-1.5 rounded-full border border-[#d4d7dc] bg-white text-[11px] font-bold text-[#393a3d] hover:bg-[#f4f5f8]"
                    >
                      Accounts receivable
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-[10px] text-[#6b6c72] hover:underline inline-flex items-center justify-center gap-1"
                  >
                    <HelpCircle size={12} />
                    Why am I seeing these suggestions?
                  </button>
                                </div>
              </div>
              </EditWrapper>
              )}

              {/* Bank accounts */}
              {selectedWidgets.bank_accounts && (
                <EditWrapper 
                  isEditing={isCustomising} 
                  grabbers={['top', 'bottom']}
                  onRemove={() => setSelectedWidgets(prev => ({...prev, bank_accounts: false}))}
                >
                  <WidgetShell
                    title="Bank accounts"
                    subtitle="Link your banks to see your balances in one place"
                    footerButtonLabel="Find your bank"
                    onFooterButton={() => runAction('bank_rec')}
                    onHide={() => setWidgetToHide('bank_accounts')}
                  >
                  {(function() {
                    const banks = biData?.bankAccounts?.length > 0 ? biData.bankAccounts : PLACEHOLDER_BANKS;
                    const perPage = 5;
                    const totalPages = Math.ceil(banks.length / perPage);
                    const page = Math.min(bankPage, Math.max(0, totalPages - 1));
                    const pageBanks = banks.slice(page * perPage, (page + 1) * perPage);
                    return (
                      <div>
                        <div className="grid grid-cols-2 gap-2">
                          {pageBanks.map((b, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-white border border-slate-150 flex items-center justify-center shrink-0">
                                <Landmark size={13} className="text-slate-500" />
                              </div>
                              <span className="text-[11px] font-bold text-slate-700 truncate leading-tight">{b.bankName || b.name || b.bankCode}</span>
                              <button type="button" className="ml-auto w-6 h-6 rounded-lg hover:bg-blue-50 text-blue-655 flex items-center justify-center shrink-0 transition-colors" aria-label="Add">
                                <Plus size={14} strokeWidth={2.5} />
                              </button>
                            </div>
                          ))}
                        </div>
                        {totalPages > 1 && (
                          <div className="flex items-center justify-center gap-2 mt-3">
                            <button
                              type="button"
                              disabled={page === 0}
                              onClick={() => setBankPage(p => p - 1)}
                              className="px-3 py-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-default transition-colors"
                            >
                              Previous
                            </button>
                            <span className="text-[11px] font-bold text-slate-400">{page + 1} / {totalPages}</span>
                            <button
                              type="button"
                              disabled={page >= totalPages - 1}
                              onClick={() => setBankPage(p => p + 1)}
                              className="px-3 py-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-default transition-colors"
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </WidgetShell>
                </EditWrapper>
              )}
            </div>
{/* Second Row: Cash Flow (span 2), Inventory Reports, Low on Stock */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
{selectedWidgets.cash_flow && (
<EditWrapper 
  isEditing={isCustomising} 
  grabbers={['left', 'right']}
  className="xl:col-span-2"
  onRemove={() => setSelectedWidgets(prev => ({...prev, cash_flow: false}))}
>
<WidgetShell
  title="Cash flow"
  subtitle="Track how your money is doing"
  footerButtonLabel={
    activeTab === 'expenses'
      ? 'View expense transactions'
      : 'Link your bank to see cash flow'
  }
  onFooterButton={() =>
    runAction(activeTab === 'expenses' ? 'expenses_detail' : 'bank_rec')
  }
  onHide={() => setWidgetToHide('cash_flow')}
>
  <div className="flex gap-3 h-[190px] pt-4 mt-2">
    
    {/* Y Axis */}
    <div className="flex flex-col justify-between text-[11px] text-[#6b6c72] w-8 shrink-0 text-right pb-[22px]">
      <span>{formatShortK(cashFlowMax)}</span>
      <span>{formatShortK(cashFlowMax / 2)}</span>
      <span>0</span>
    </div>

    {/* Chart */}
    <div className="flex-1 relative">
      
      {/* Grid */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-[22px]">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border-t border-[#e5e7eb] w-full"
          />
        ))}
      </div>

      {/* Bars */}
      <div className="absolute top-0 bottom-[22px] left-0 right-0 flex justify-between px-1">
        {monthlyData.map((d) => (
          <div key={d.m} className="flex gap-[2px] items-end flex-1 justify-center relative group cursor-pointer hover:bg-slate-100 rounded-t-lg transition-all duration-200" title={`${d.m}: LKR ${formatShortK(monthlyExpenses[MONTHS.indexOf(d.m)])}`}>
            <div className={`w-[11px] rounded-full transition-all duration-500 ${d.hasData ? 'bg-gradient-to-t from-emerald-600 to-green-450' : 'bg-slate-200'}`} style={{ height: `${d.h1}%` }} />
            <div className={`w-[11px] rounded-full transition-all duration-500 ${d.hasData ? 'bg-gradient-to-t from-blue-655 to-cyan-455' : 'bg-slate-300'}`} style={{ height: `${d.h2}%` }} />
          </div>
        ))}
      </div>
      
      {/* Months */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 border-t border-slate-200/80 pt-2">
        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
          <div key={m} className="flex-1 text-center text-[10px] font-bold text-slate-500">
            {m}
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* Transactions */}
  {activeTab === 'expenses' &&
    expenseData.recentTransactions?.length > 0 && (
      <div className="mt-4 pt-3 border-t border-[#eceef1] space-y-2">
        {expenseData.recentTransactions
          .slice(0, 4)
          .map((tx, i) => (
            <div
              key={i}
              className="flex justify-between text-[11px]"
            >
              <span className="font-semibold text-[#393a3d] truncate max-w-[65%]">
                {tx.payee || tx.type}
              </span>

              <span className="font-mono font-bold text-[#111827]">
                {formatLkr(tx.total)}
              </span>
            </div>
          ))}
      </div>
    )}
</WidgetShell>
</EditWrapper>
)}

  {selectedWidgets.inventory_reports && (
    <EditWrapper 
      isEditing={isCustomising} 
      grabbers={['left', 'right']}
      onRemove={() => setSelectedWidgets(prev => ({...prev, inventory_reports: false}))}
    >
      <WidgetShell 
        title="Inventory Reports" 
        footerButtonLabel="View all reports"
        onHide={() => setWidgetToHide('inventory_reports')}
      >
        <div className="space-y-2 mt-2">
          {['Inventory valuation summary', 'Inventory valuation detail', 'Stock take worksheet', 'Products and services list', 'Sales by products - Summary', 'Open sales order by item', 'Open sales order by customer'].map(r => (
            <div key={r} className="flex justify-between items-center border-b border-[#eceef1] pb-1.5 last:border-0">
              <span className="text-[12px] text-[#393a3d] truncate pr-2">{r}</span>
              <button className="text-[#0078d4] text-[12px] font-bold hover:underline shrink-0">View</button>
            </div>
          ))}
        </div>
      </WidgetShell>
    </EditWrapper>
  )}

  {selectedWidgets.low_on_stock && (
    <EditWrapper 
      isEditing={isCustomising} 
      grabbers={['left', 'right']}
      onRemove={() => setSelectedWidgets(prev => ({...prev, low_on_stock: false}))}
    >
      <WidgetShell 
        title="Low on Stock" 
        subtitle="Never miss a sale with items that are running low" 
        footerButtonLabel="Start tracking inventory"
        onHide={() => setWidgetToHide('low_on_stock')}
      >
        <table className="w-full text-left text-[11px] mt-4">
          <thead>
            <tr className="border-b border-[#eceef1] text-[#6b6c72]">
              <th className="font-bold py-1">PRODUCT</th>
              <th className="font-bold py-1 text-right">QTY</th>
              <th className="font-bold py-1 text-right">REORDER</th>
            </tr>
          </thead>
          <tbody className="text-[#393a3d]">
            {(biData?.lowStock?.length > 0 ? biData.lowStock : []).map((item, i) => (
              <tr key={i} className="border-b border-[#eceef1] border-dashed">
                <td className="py-2 truncate max-w-[100px]">{item.productName || item.productCode || 'Product name'}</td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">Reorder</td>
              </tr>
            ))}
            {(biData?.lowStock?.length || 0) === 0 && (
              <tr>
                <td className="py-2 text-[#8d9096]" colSpan={3}>No low stock items</td>
              </tr>
            )}
          </tbody>
        </table>
      </WidgetShell>
    </EditWrapper>
  )}
</div>

{/* Third Row: Invoices, Customers Funnel */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
  {selectedWidgets.invoices && (
    <EditWrapper 
      isEditing={isCustomising} 
      grabbers={['left', 'right']}
      onRemove={() => setSelectedWidgets(prev => ({...prev, invoices: false}))}
    >
      <WidgetShell 
        title="Invoices"
        onHide={() => setWidgetToHide('invoices')}
      >
        <div className="flex flex-col gap-8 py-2 mt-4">
          <div>
            <div className="flex justify-between text-[11.5px] font-bold text-slate-500 mb-1">
              <span>UNPAID <span className="font-normal text-slate-400 ml-1">Last 365 days</span></span>
            </div>
            <div className="flex gap-1 h-[14px] mt-8">
              <div className={`relative ${(biData?.invoiceSummary?.totalOverdue || 0) > 0 ? 'bg-gradient-to-r from-red-500 to-rose-500' : 'bg-slate-200'} rounded-l-full`} style={{ width: `${(biData?.invoiceSummary?.totalOverdue || 0) > 0 ? 50 : 50}%` }}>
                <span className="absolute bottom-full left-0 mb-1 text-[13.5px] font-extrabold text-slate-800">{formatLkr(biData?.invoiceSummary?.totalOverdue || 0)}</span>
                <span className="absolute top-full left-0 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overdue</span>
              </div>
              <div className="w-1/2 bg-slate-200 rounded-r-full relative">
                <span className="absolute bottom-full right-0 mb-1 text-[13.5px] font-extrabold text-slate-800">{formatLkr((biData?.invoiceSummary?.totalUnpaid || 0) - (biData?.invoiceSummary?.totalOverdue || 0))}</span>
                <span className="absolute top-full right-0 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right whitespace-nowrap">Not due yet</span>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-[11.5px] font-bold text-slate-500 mb-1">
              <span>PAID <span className="font-normal text-slate-400 ml-1">Last 30 days</span></span>
            </div>
            <div className="flex gap-1 h-[14px] mt-8">
              <div className={`relative ${(biData?.invoiceSummary?.totalPaid || 0) > 0 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-slate-200'} rounded-l-full`} style={{ width: `${(biData?.invoiceSummary?.totalPaid || 0) > 0 ? 50 : 50}%` }}>
                <span className="absolute bottom-full left-0 mb-1 text-[13.5px] font-extrabold text-slate-800">{formatLkr(biData?.invoiceSummary?.totalNotDeposited || 0)}</span>
                <span className="absolute top-full left-0 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Not deposited</span>
              </div>
              <div className="w-1/2 bg-emerald-500 rounded-r-full relative">
                <span className="absolute bottom-full right-0 mb-1 text-[13.5px] font-extrabold text-slate-800">{formatLkr(biData?.invoiceSummary?.totalDeposited || 0)}</span>
                <span className="absolute top-full right-0 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right whitespace-nowrap">Deposited</span>
              </div>
            </div>
          </div>
        </div>
      </WidgetShell>
    </EditWrapper>
  )}

  {selectedWidgets.customers_funnel && (
    <EditWrapper 
      isEditing={isCustomising} 
      grabbers={['left', 'right']}
      className="xl:col-span-3"
      onRemove={() => setSelectedWidgets(prev => ({...prev, customers_funnel: false}))}
    >
      <WidgetShell title="Customers Funnel">
        <div className="absolute top-5 right-5 text-[11px] font-semibold text-slate-400">As of today</div>
        <div className="flex items-center justify-between gap-1 overflow-x-auto py-2 h-full mt-4 pb-4 no-scrollbar">
          {[
            { label: 'Open opportunities', val: String(biData?.customerFunnel?.totalCustomers || '0'), color: '#34d399' },
            { label: 'Open estimates', val: String(biData?.customerFunnel?.openEstimates || '0'), color: '#10b981' },
            { label: 'Open contracts', val: String(biData?.customerFunnel?.openContracts || '0'), color: '#059669' },
            { label: 'In progress projects', val: String(biData?.customerFunnel?.inProgressProjects || '0'), color: '#047857' },
            { label: 'Unpaid invoices', val: String(biData?.customerFunnel?.unpaidInvoices || '0'), color: '#064e3b' },
            { label: 'Reviews', val: String(biData?.customerFunnel?.reviewCount || '0'), color: '#022c22' },
          ].map((f, i, arr) => (
            <React.Fragment key={i}>
              <div className="border border-slate-100 rounded-2xl flex flex-col min-w-[115px] flex-1 shrink-0 h-[105px] overflow-hidden bg-slate-50/40 hover:bg-white hover:border-slate-200 hover:shadow-md transition-all duration-305 relative shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: f.color }} />
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <span className="text-[12px] font-bold text-slate-500 leading-tight">{f.label}</span>
                  <span className="text-[22px] font-extrabold text-slate-800">{f.val}</span>
                </div>
              </div>
              {i < arr.length - 1 && <ChevronRight size={14} className="text-slate-400 shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </WidgetShell>
    </EditWrapper>
  )}
</div>

{/* Fourth Row: Sales, AP, AR, Sales Orders */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
  {selectedWidgets.sales && (
    <EditWrapper 
      isEditing={isCustomising} 
      grabbers={['left', 'right']}
      onRemove={() => setSelectedWidgets(prev => ({...prev, sales: false}))}
    >
      <WidgetShell title="Sales">
        <div className="absolute top-4 right-6 text-[11px] text-[#6b6c72] flex items-center gap-1 cursor-pointer hover:text-[#393a3d]">
          This year to date <ChevronDown size={12} />
        </div>
        <div className="mt-4 text-[11px] text-[#6b6c72]">Total Amount</div>
        <div className="text-[20px] font-bold text-[#393a3d] mb-4">{formatLkr(biData?.salesSummary?.totalSalesYTD || 0)}</div>
        <div className="relative h-[80px] border-l border-[#d4d7dc] flex items-end ml-4 mt-6">
          <div className="absolute -left-5 bottom-[0%] text-[10px] text-[#8d9096]">0</div>
          <div className="absolute -left-6 bottom-[25%] text-[10px] text-[#8d9096]">{formatShortK((biData?.salesSummary?.totalSalesYTD || 0) / 4)}</div>
          <div className="absolute -left-6 bottom-[50%] text-[10px] text-[#8d9096]">{formatShortK((biData?.salesSummary?.totalSalesYTD || 0) / 2)}</div>
          <div className="absolute -left-6 bottom-[75%] text-[10px] text-[#8d9096]">{formatShortK((biData?.salesSummary?.totalSalesYTD || 0) * 3 / 4)}</div>
          <div className="absolute -left-6 bottom-[100%] text-[10px] text-[#8d9096]">{formatShortK(biData?.salesSummary?.totalSalesYTD || 0)}</div>
          {[0, 25, 50, 75, 100].map(p => (
            <div key={p} className="absolute left-0 right-0 border-t border-[#eceef1]" style={{ bottom: `${p}%` }} />
          ))}
          {(biData?.salesSummary?.monthlySales || []).map((amt, i) => {
            const max = Math.max(...(biData?.salesSummary?.monthlySales || [0]), 1);
            const h = max > 0 ? Math.round((amt / max) * 100) : 0;
            return (
              <div key={i} className="flex-1 flex items-end justify-center h-full relative group cursor-pointer" title={`Month ${i+1}: ${formatLkr(amt)}`}>
                <div className="w-[6px] bg-gradient-to-t from-blue-600 to-sky-400 rounded-t-sm transition-all duration-500" style={{ height: `${Math.max(2, h)}%` }} />
              </div>
            );
          })}
        </div>
      </WidgetShell>
    </EditWrapper>
  )}

  {selectedWidgets.accounts_payable && (
    <EditWrapper 
      isEditing={isCustomising} 
      grabbers={['left', 'right']}
      onRemove={() => setSelectedWidgets(prev => ({...prev, accounts_payable: false}))}
    >
      <WidgetShell title="Accounts Payable">
        <div className="absolute top-4 right-4 text-[11px] text-[#6b6c72]">As of today</div>
        <div className="mt-4 text-[11px] text-[#6b6c72]">Total</div>
        <div className="text-[20px] font-bold text-[#393a3d] mb-4">{formatLkr(biData?.accountsPayable?.total || 0)}</div>
        <div className="flex items-center gap-6 mt-4">
          <div className="relative w-[70px] h-[70px] rounded-full border-[12px] shrink-0" style={{
            borderColor: (biData?.accountsPayable?.total || 0) > 0 ? '#2ca01c' : '#d4d7dc'
          }} />
          <div className="text-[11px] space-y-1.5 text-[#393a3d]">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#2ca01c]"/>Current: {formatLkr(biData?.accountsPayable?.current || 0)}</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#0078d4]"/>1 - 30: {formatLkr(biData?.accountsPayable?.aging1_30 || 0)}</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#7c3aed]"/>31 - 60: {formatLkr(biData?.accountsPayable?.aging31_60 || 0)}</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#0d9488]"/>61 - 90: {formatLkr(biData?.accountsPayable?.aging61_90 || 0)}</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#e33e07]"/>91 and over: {formatLkr(biData?.accountsPayable?.aging91Plus || 0)}</div>
          </div>
        </div>
      </WidgetShell>
    </EditWrapper>
  )}

  {selectedWidgets.accounts_receivable && (
    <EditWrapper 
      isEditing={isCustomising} 
      grabbers={['left', 'right']}
      onRemove={() => setSelectedWidgets(prev => ({...prev, accounts_receivable: false}))}
    >
      <WidgetShell title="Accounts Receivable">
        <div className="absolute top-4 right-4 text-[11px] text-[#6b6c72]">As of today</div>
        <div className="mt-4 text-[11px] text-[#6b6c72]">Total</div>
        <div className="text-[20px] font-bold text-[#393a3d] mb-4">{formatLkr(biData?.accountsReceivable?.total || 0)}</div>
        <div className="flex items-center gap-6 mt-4">
          <div className="relative w-[70px] h-[70px] rounded-full border-[12px] shrink-0" style={{
            borderColor: (biData?.accountsReceivable?.total || 0) > 0 ? '#2ca01c' : '#d4d7dc'
          }} />
          <div className="text-[11px] space-y-1.5 text-[#393a3d]">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#2ca01c]"/>Current: {formatLkr(biData?.accountsReceivable?.current || 0)}</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#0078d4]"/>1 - 30: {formatLkr(biData?.accountsReceivable?.aging1_30 || 0)}</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#7c3aed]"/>31 - 60: {formatLkr(biData?.accountsReceivable?.aging31_60 || 0)}</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#0d9488]"/>61 - 90: {formatLkr(biData?.accountsReceivable?.aging61_90 || 0)}</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#e33e07]"/>91 and over: {formatLkr(biData?.accountsReceivable?.aging91Plus || 0)}</div>
          </div>
        </div>
      </WidgetShell>
    </EditWrapper>
  )}

  {selectedWidgets.sales_orders && (
    <EditWrapper 
      isEditing={isCustomising} 
      grabbers={['left', 'right']}
      onRemove={() => setSelectedWidgets(prev => ({...prev, sales_orders: false}))}
    >
      <WidgetShell title="Sales Orders" subtitle="Take charge of your finances with open sales orders" footerButtonLabel="Get started with sales orders">
        <table className="w-full text-left text-[11px] mt-4">
          <thead>
            <tr className="border-b border-[#eceef1] text-[#6b6c72]">
              <th className="font-bold py-1">SO NO.</th>
              <th className="font-bold py-1 text-center">CUSTOMER</th>
              <th className="font-bold py-1 text-right">AMOUNT</th>
            </tr>
          </thead>
          <tbody className="text-[#393a3d]">
            {(biData?.salesOrders?.length > 0 ? biData.salesOrders : []).map((so, i) => (
              <tr key={i} className="border-b border-[#eceef1] border-dashed">
                <td className="py-2">{so.docNo || 'SO'}</td>
                <td className="py-2 text-center">{so.customer || '--'}</td>
                <td className="py-2 text-right">{formatLkr(so.amount || 0)}</td>
              </tr>
            ))}
            {(biData?.salesOrders?.length || 0) === 0 && (
              <tr>
                <td className="py-2 text-[#8d9096]" colSpan={3}>No open sales orders</td>
              </tr>
            )}
          </tbody>
        </table>
      </WidgetShell>
    </EditWrapper>
  )}
</div>

{/* Fifth Row: Work Requests, Reviews, Overdue Invoices, Referrals */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
  {selectedWidgets.work_requests && (
    <EditWrapper 
      isEditing={isCustomising} 
      grabbers={['left', 'right']}
      onRemove={() => setSelectedWidgets(prev => ({...prev, work_requests: false}))}
    >
      <WidgetShell title="Work Requests" subtitle="Drive repeat business using the post-invoice survey" footerButtonLabel="Manage survey settings">
        <div className="flex-1 flex items-center justify-center py-6">
          <div className="border border-[#eceef1] rounded-lg shadow-sm p-3 flex gap-3 max-w-[160px] bg-white z-10 relative">
            <div className="w-6 h-6 rounded-full bg-[#d4d7dc] shrink-0" />
            <div className="flex-1 space-y-1.5 pt-0.5">
              <div className="h-2.5 w-10 bg-[#eceef1] rounded-sm" />
              <div className="text-[10px] text-[#6b6c72] leading-tight">wants to work with you again</div>
            </div>
          </div>
        </div>
      </WidgetShell>
    </EditWrapper>
  )}

  {selectedWidgets.reviews && (
    <EditWrapper 
      isEditing={isCustomising} 
      grabbers={['left', 'right']}
      onRemove={() => setSelectedWidgets(prev => ({...prev, reviews: false}))}
    >
      <WidgetShell title="Reviews">
        {biData?.reviews?.reviewCount > 0 ? (
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-[28px] font-extrabold text-slate-800">{biData.reviews.avgRating}</span>
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={14} className={s <= Math.round(biData.reviews.avgRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} />
                ))}
              </div>
              <span className="text-[12px] text-slate-500 ml-1">({biData.reviews.reviewCount} reviews)</span>
            </div>
            <div className="space-y-1.5">
              {[5,4,3,2,1].map(s => {
                const count = biData.reviews.ratingDistribution?.[s] || 0;
                const pct = biData.reviews.reviewCount > 0 ? Math.round((count / biData.reviews.reviewCount) * 100) : 0;
                return (
                  <div key={s} className="flex items-center gap-2 text-[11px]">
                    <span className="w-6 text-right font-bold text-slate-500">{s}</span>
                    <Star size={10} className="text-amber-400 fill-amber-400 shrink-0" />
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-right text-slate-500">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-4 text-[13px] text-slate-500">No reviews yet. Be the first to rate the system!</div>
        )}
      </WidgetShell>
    </EditWrapper>
  )}

  {selectedWidgets.overdue_invoices && (
    <EditWrapper 
      isEditing={isCustomising} 
      grabbers={['left', 'right']}
      onRemove={() => setSelectedWidgets(prev => ({...prev, overdue_invoices: false}))}
    >
      <WidgetShell title="Overdue Invoices">
        <div className="mt-4 text-[14px] font-bold text-[#393a3d] leading-snug pr-4">
          You have {formatLkr(biData?.overdueInvoiceTotal || 0)} in invoices that are overdue.
        </div>
        <div className="text-[12px] text-[#6b6c72] mt-2">
          {(biData?.overdueInvoiceTotal || 0) > 0 ? 'Review your overdue invoices to avoid late fees.' : 'Create an invoice for your next job!'}
        </div>
      </WidgetShell>
    </EditWrapper>
  )}

  {selectedWidgets.referrals && (
    <EditWrapper 
      isEditing={isCustomising} 
      grabbers={['left', 'right']}
      onRemove={() => setSelectedWidgets(prev => ({...prev, referrals: false}))}
    >
      <WidgetShell title="Referrals" subtitle="Generate referrals using the post-invoice survey" footerButtonLabel="Manage survey settings">
        <div className="flex-1 flex items-center justify-center py-6">
          <div className="border border-[#eceef1] rounded-lg shadow-sm p-3 flex flex-col gap-3 max-w-[160px] bg-white z-10 relative">
            <div className="text-[10px] text-[#393a3d] font-bold text-center">You've received a new referral</div>
            <div className="flex items-center gap-3 justify-center">
              <div className="w-6 h-6 rounded-full bg-[#d4d7dc] shrink-0" />
              <div className="h-2.5 w-10 bg-[#eceef1] rounded-sm" />
            </div>
          </div>
        </div>
      </WidgetShell>
    </EditWrapper>
  )}
</div>

{/* Sixth Row: Video Tutorials */}
{selectedWidgets.video_tutorials && (
  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-8">
    <EditWrapper 
      isEditing={isCustomising} 
      grabbers={['left', 'right']}
      className="xl:col-span-1"
      onRemove={() => setSelectedWidgets(prev => ({...prev, video_tutorials: false}))}
    >
      <WidgetShell title="Video tutorials" subtitle="Watch and learn how to use your dashboard">
        <div className="grid grid-cols-2 gap-5 mt-4 h-full pb-4">
          <div className="flex flex-col gap-2.5">
            <div 
              className="relative w-full rounded-2xl overflow-hidden bg-slate-100 aspect-video group cursor-pointer flex items-center justify-center border border-slate-150 shadow-sm hover:shadow-lg transition-all duration-300"
              onClick={() => setVideoOpen('get_started')}
            >
              <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80" alt="Thumbnail 1" className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:opacity-95 group-hover:scale-103 transition-all duration-350" />
              <div className="w-11 h-11 rounded-full bg-white shadow-xl flex items-center justify-center z-10 text-emerald-600 group-hover:scale-110 transition-transform duration-200">
                <Play size={18} fill="currentColor" className="ml-0.5" />
              </div>
            </div>
            <div className="text-[12.5px] font-bold text-slate-700 leading-snug tracking-tight px-1">Getting started with ONIMTA Accounts</div>
          </div>
          <div className="flex flex-col gap-2.5">
            <div 
              className="relative w-full rounded-2xl overflow-hidden bg-slate-100 aspect-video group cursor-pointer flex items-center justify-center border border-slate-150 shadow-sm hover:shadow-lg transition-all duration-300"
              onClick={() => setVideoOpen('track_expenses')}
            >
              <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80" alt="Thumbnail 2" className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:opacity-95 group-hover:scale-103 transition-all duration-350" />
              <div className="w-11 h-11 rounded-full bg-white shadow-xl flex items-center justify-center z-10 text-emerald-600 group-hover:scale-110 transition-transform duration-200">
                <Play size={18} fill="currentColor" className="ml-0.5" />
              </div>
            </div>
            <div className="text-[12.5px] font-bold text-slate-700 leading-snug tracking-tight px-1">How to track your expenses efficiently</div>
          </div>
        </div>
      </WidgetShell>
    </EditWrapper>
  </div>
)}
              </>
            )}
          </div>
        </div>
      <AddWidgetsPanel 
        isOpen={isAddWidgetsOpen} 
        onClose={() => setIsAddWidgetsOpen(false)} 
        initialSelected={selectedWidgets} 
        onSave={(newSelected) => setSelectedWidgets(prev => ({ ...prev, ...newSelected }))}
      />
      <ShowAllActionsPanel 
        isOpen={isShowAllActionsOpen}
        onClose={() => setIsShowAllActionsOpen(false)}
        favActions={favActions}
        onSave={(newFavs) => setFavActions(newFavs)}
      />

      <VideoTutorialsModal 
        isOpen={!!videoOpen} 
        initialVideoId={videoOpen} 
        onClose={() => setVideoOpen(null)} 
      />

      {/* Hide Widget Confirmation Modal */}
      {widgetToHide && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-end p-3 pb-0">
              <button 
                onClick={() => setWidgetToHide(null)}
                className="text-[#6b6c72] hover:bg-slate-100 p-1.5 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 pb-6 text-center">
              <h3 className="text-[20px] font-bold text-[#393a3d] leading-tight mb-3">
                Are you sure you want<br/>to hide this widget?
              </h3>
              <p className="text-[14px] text-[#6b6c72] mb-6">
                To add it back, select Customise.
              </p>
              <div className="w-full h-px bg-[#d4d7dc] mb-6" />
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setWidgetToHide(null)}
                  className="px-6 py-2 rounded-full border-2 border-[#0078d4] text-[#0078d4] font-bold text-[14px] hover:bg-blue-50 transition-colors min-w-[100px]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setSelectedWidgets(prev => ({...prev, [widgetToHide]: false}));
                    setWidgetToHide(null);
                  }}
                  className="px-6 py-2 rounded-full border-2 border-[#0078d4] bg-[#0078d4] text-white font-bold text-[14px] hover:bg-[#005a9e] transition-colors min-w-[100px]"
                >
                  Hide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetThingsDoneBoard;
