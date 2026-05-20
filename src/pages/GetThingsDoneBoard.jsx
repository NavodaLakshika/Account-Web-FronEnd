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
    <div className={`group relative rounded-lg ring-[1.5px] ring-[#0078d4] z-10 transition-all ${className} hover:ring-2 hover:shadow-lg`}>
      {grabbers.includes('left') && <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#0078d4] z-20 cursor-move" title="Change place" />}
      {grabbers.includes('right') && <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#0078d4] z-20 cursor-move" title="Change place" />}
      {grabbers.includes('top') && <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#0078d4] z-20 cursor-move" title="Change place" />}
      {grabbers.includes('bottom') && <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#0078d4] z-20 cursor-move" title="Change place" />}
      
      {onRemove && (
        <button 
          onClick={onRemove}
          className="absolute -top-3 -right-3 w-6 h-6 bg-white border border-[#d4d7dc] rounded-full flex items-center justify-center text-[#ff3b30] shadow-md hover:bg-[#ff3b30] hover:text-white hover:border-[#ff3b30] transition-colors z-30 opacity-0 group-hover:opacity-100"
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

      <div className="opacity-40 pointer-events-none select-none transition-opacity h-full">
        {children}
      </div>
    </div>
  );
};

/** QBO-style widget: white card + optional full-width footer button */
const WidgetShell = ({ title, subtitle, children, footerButtonLabel, onFooterButton, onHide }) => (
  <div className="group relative bg-white border border-[#d4d7dc] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col min-h-[240px] h-full">
    <div className="p-4 sm:p-5 flex-1 flex flex-col min-h-0 relative">
      <div className="flex justify-between items-start gap-2 mb-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#393a3d]">
          {title}
        </span>
        {onHide ? (
          <button 
            onClick={onHide} 
            className="text-[12px] font-bold text-[#0078d4] opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 sm:right-5 top-4 sm:top-5 bg-white z-10 hover:text-[#005a9e]"
          >
            Hide
          </button>
        ) : (
          <ChevronDown size={14} className="text-[#8d9096] shrink-0 mt-0.5" />
        )}
      </div>
      <p className="text-[14px] sm:text-[15px] font-bold text-[#393a3d] leading-snug">{subtitle}</p>
      <div className="flex-1 min-h-0 mt-3 overflow-hidden">{children}</div>
    </div>
    {footerButtonLabel && (
      <div className="px-3 pb-3 pt-0 shrink-0">
        <button
          type="button"
          onClick={onFooterButton}
          className="w-full h-9 rounded-md border border-[#d4d7dc] bg-white text-[12px] font-bold text-[#393a3d] hover:bg-[#f4f5f8] transition-colors"
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
    className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-[#393a3d] hover:bg-black/[0.06] active:bg-black/[0.08] transition-colors shrink-0"
  >
    {children}
  </button>
);

const GetThingsDoneBoard = ({ isOpen, onClose, user, selectedCompany, onAction }) => {
  const [activeTab, setActiveTab] = useState('expenses');
  const [isCustomising, setIsCustomising] = useState(false);
  const [isAddWidgetsOpen, setIsAddWidgetsOpen] = useState(false);
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
        const [res, incomeRes] = await Promise.all([
          expensesService.getDashboardData(companyCode, 'all'),
          expensesService.getIncomeSummary(companyCode),
        ]);
        
        // Workaround for backend duplicate category issue
        if (res.categoryBreakdown && Array.isArray(res.categoryBreakdown)) {
          const cleaned = [];
          res.categoryBreakdown.forEach(cat => {
            if (/^\d+$/.test(cat.categoryName)) {
              const duplicate = res.categoryBreakdown.find(c => c.amount === cat.amount && !/^\d+$/.test(c.categoryName));
              if (duplicate) return;
            }
            cleaned.push(cat);
          });
          const total = cleaned.reduce((sum, c) => sum + c.amount, 0);
          cleaned.forEach(c => {
            c.percentage = total > 0 ? Math.round((c.amount / total) * 100) : 0;
          });
          res.categoryBreakdown = cleaned;
        }

        if (!cancelled) {
          setExpenseData(res);
          setTotalIncome(incomeRes.totalIncome || 0);
        }
      } catch {
        if (!cancelled) {
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 font-['Plus_Jakarta_Sans'] text-[#393a3d]">
      <div className="absolute inset-0 bg-[#393a3d]/45 backdrop-blur-[2px]" />

      <div className="relative w-full max-w-[min(2100px,calc(100vw-1rem))] max-h-[min(100dvh,calc(100dvh-1.5rem))] min-h-0 bg-[#f4f5f8] rounded-[5px] shadow-2xl border border-[#d4d7dc] flex flex-col overflow-hidden">
        {/* QBO-style top header */}
        <header className="shrink-0 bg-[#f4f5f8] border-b border-[#d4d7dc] px-3 sm:px-4 lg:px-6 py-2.5">
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
                  <div className="text-[9px] font-bold text-[#393a3d] tracking-[0.12em] uppercase">
                    ONIMTA
                  </div>
                  <div className="text-[11px] font-bold text-[#393a3d] tracking-tight">Accounts</div>
                </div>
              </div>
              <div className="h-6 w-px bg-[#babec5] shrink-0 hidden sm:block" aria-hidden />
            
              <span
                className="text-[11px] sm:text-[13px] font-bold text-[#393a3d] uppercase tracking-wide truncate min-w-0"
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
                className="w-full max-w-lg lg:max-w-2xl xl:max-w-3xl flex items-center gap-2.5 h-9 sm:h-10 pl-3 sm:pl-4 pr-3 rounded-full bg-white border border-[#d4d7dc] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-[#8d9096] text-left transition-colors"
              >
                <Search size={17} className="text-[#6b6c72] shrink-0" strokeWidth={2} />
                <span className="text-[12px] sm:text-[13px] text-[#8d9096] truncate">
                </span>
              </button>
            </div>

            {/* Right: utilities + close */}
            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
              <HeaderIconBtn label="Tasks" onClick={() => runAction('header_tasks')}>
                <ClipboardList size={19} strokeWidth={1.9} className="text-[#393a3d]" />
              </HeaderIconBtn>
              <HeaderIconBtn label="Quick menu" onClick={() => runAction('header_apps')}>
                <LayoutGrid size={19} strokeWidth={1.9} className="text-[#393a3d]" />
              </HeaderIconBtn>
              <HeaderIconBtn label="Notifications" onClick={() => runAction('header_notifications')}>
                <Bell size={19} strokeWidth={1.9} className="text-[#393a3d]" />
              </HeaderIconBtn>
              <HeaderIconBtn label="Settings" onClick={() => runAction('header_settings')}>
                <Settings size={19} strokeWidth={1.9} className="text-[#393a3d]" />
              </HeaderIconBtn>
              <HeaderIconBtn label="Help" onClick={() => runAction('header_help')}>
                <HelpCircle size={19} strokeWidth={1.9} className="text-[#393a3d]" />
              </HeaderIconBtn>
              <HeaderIconBtn label="Your profile" onClick={() => runAction('header_profile')}>
                <span className="w-8 h-8 rounded-full bg-[#0078d4] text-white text-[13px] font-bold flex items-center justify-center">
                  {userInitial}
                </span>
              </HeaderIconBtn>
              <HeaderIconBtn label="Assistant" onClick={() => runAction('header_ai')}>
                <Sparkles size={19} strokeWidth={1.9} className="text-[#0078d4]" />
              </HeaderIconBtn>
              <button
                type="button"
                onClick={onClose}
                className="ml-0.5 w-8 h-8 sm:w-8 sm:h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-lg shadow-md transition-all active:scale-95 border-none shrink-0"
                title="Close"
              >
                <X size={18} strokeWidth={3} />
              </button>
            </div>
          </div>
        </header>

        {/* Body (no duplicate slim chrome) */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <div className="w-full max-w-[min(2050px,100%)] mx-auto px-3 sm:px-6 lg:px-10 pb-8">
            {/* Greeting + utilities */}
            <div className="relative pt-5 sm:pt-8 pb-4">
              <div className="absolute right-0 top-5 sm:top-8 flex items-center gap-3 sm:gap-4 text-[12px] sm:text-[13px] font-bold text-[#393a3d]">
                {isCustomising ? (
                  <>
                    <button className="text-[#0078d4] hover:underline transition-colors hidden sm:block">
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
                      className="flex items-center gap-1.5 hover:text-[#0078d4] transition-colors"
                      onClick={() => setVideoOpen('get_started')}
                    >
                      <PlayCircle size={15} className="text-[#6b6c72]" />
                      <span className="hidden sm:inline">Video tutorials</span>
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 hover:text-[#0078d4] transition-colors"
                      onClick={() => setIsCustomising(true)}
                    >
                      <SlidersHorizontal size={15} className="text-[#6b6c72]" />
                      <span className="hidden sm:inline">Customise</span>
                    </button>
                    <div className="relative group flex items-center">
                      <button 
                        type="button" 
                        onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                        className={`flex items-center gap-1.5 transition-colors ${isPrivacyMode ? 'text-[#393a3d]' : 'hover:text-[#0078d4]'}`}
                      >
                        {isPrivacyMode ? <EyeOff size={15} className="text-[#6b6c72]" /> : <Eye size={15} className="text-[#6b6c72]" />}
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
              <h1 className="text-center text-[28px] sm:text-[34px] lg:text-[38px] font-light text-[#393a3d] tracking-tight px-8 sm:px-0">
                {greeting},{' '}
                <span className="font-bold">{userName}!</span>
              </h1>
            </div>

            {/* Dark category pills + scroll */}
            <EditWrapper isEditing={isCustomising} className="mb-5 py-2 px-1">
              <div className="flex items-center justify-center gap-1 sm:gap-2 w-full">
                <div
                  ref={tabScrollRef}
                  className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 max-w-full min-w-0"
                >
                  {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`shrink-0 flex items-center gap-2 pl-1 pr-3 sm:pr-4 h-9 sm:h-10 rounded-[20px] text-left transition-all border ${
                          isActive
                            ? 'bg-[#eceef1] border-[#d4d7dc] shadow-sm'
                            : 'bg-white border-[#d4d7dc] hover:bg-[#f4f5f8]'
                        }`}
                      >
                        <span
                          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-[#0e1826]"
                          style={{ color: tab.iconBg }}
                        >
                          <Icon size={14} strokeWidth={2.5} />
                        </span>
                        <span className={`text-[11px] sm:text-[12px] font-semibold whitespace-nowrap pr-1 ${isActive ? 'text-[#111827]' : 'text-[#393a3d]'}`}>
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
              <EditWrapper isEditing={isCustomising} className="mb-5 py-2 px-1">
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-center gap-2 sm:gap-2">
                  <span className="text-[13px] font-bold text-[#393a3d] sm:mr-2 shrink-0">Create actions</span>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {DISPLAY_CREATE_ACTIONS.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => runAction(a.id)}
                        className="px-3 sm:px-3.5 h-8 rounded-full text-[12px] sm:text-[13px] font-semibold text-[#393a3d] bg-white border border-[#d4d7dc] hover:border-[#8d9096] hover:shadow-sm transition-all whitespace-nowrap"
                      >
                        {a.label}
                      </button>
                    ))}
                    {topActions.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => runAction(a.id)}
                        className="px-3 sm:px-3.5 h-8 rounded-full text-[12px] sm:text-[13px] font-semibold text-[#393a3d] bg-white border border-[#d4d7dc] hover:border-[#8d9096] hover:shadow-sm transition-all whitespace-nowrap"
                      >
                        {a.label}
                      </button>
                    ))}
                    {activeTab === 'accounting' && (
                      <button
                        type="button"
                        onClick={() => setIsShowAllActionsOpen(true)}
                        className="text-[13px] font-bold text-[#0078d4] hover:underline ml-1"
                      >
                        Show all
                      </button>
                    )}
                  </div>
                </div>
              </EditWrapper>
            )}

            <div className="border-b border-[#d4d7dc] pb-2 mb-4">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#6b6c72]">
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
                  <div className="flex flex-col justify-center h-full gap-5 py-2 mt-2">
                    {[
                      { label: 'Income', val: totalIncome, color: '#2ca01c' },
                      { label: 'Expenses', val: totalSpend, color: '#27a8b0' },
                    ].map((bar, idx) => {
                      const max = Math.max(totalIncome, totalSpend, 1);
                      const hasData = bar.val > 0;
                      const wPct = hasData ? Math.max(10, Math.round((bar.val / max) * 100)) : 0;
                      return (
                        <div key={idx} className="flex flex-col gap-0.5">
                          <div className="text-[14px] font-bold text-[#393a3d]">LRs{formatShortK(bar.val)}</div>
                          <div className="flex items-center gap-2">
                            <div className="text-[12px] text-[#6b6c72] w-[60px] shrink-0">{bar.label}</div>
                            {hasData ? (
                              <div 
                                className="h-5 transition-all duration-700 rounded-sm"
                                style={{ width: `${wPct}%`, backgroundColor: bar.color }}
                              />
                            ) : (
                              <div className="h-5 w-[6px] bg-[#d4d7dc] rounded-sm" />
                            )}
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
                        <div className="flex-1 space-y-2 w-full max-w-[160px] text-[12px]">
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
                                <span className="truncate flex-1 text-[#393a3d] text-[12px]">
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
                  <div className="space-y-2.5">
                    {PLACEHOLDER_BANKS.map((b, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-2 border-b border-[#eceef1] pb-2 last:border-0"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-md bg-[#eceef1] flex items-center justify-center shrink-0">
                            <Landmark size={16} className="text-[#6b6c72]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] text-[#393a3d] truncate">{b.name}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="w-6 h-6 flex items-center justify-center text-[#0078d4] shrink-0"
                          aria-label="Add"
                        >
                          <Plus size={18} strokeWidth={2.5} />
                        </button>
                      </div>
                    ))}
                  </div>
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
          <div key={d.m} className="flex gap-[1px] items-end flex-1 justify-center relative group cursor-pointer hover:bg-black/5 rounded-t-sm transition-colors" title={`${d.m}: LRs${formatShortK(monthlyExpenses[MONTHS.indexOf(d.m)])}`}>
            <div className={`w-[14px] rounded-t-sm transition-all ${d.hasData ? 'bg-[#8cc63f]' : 'bg-[#d4d7dc]'}`} style={{ height: `${d.h1}%` }} />
            <div className={`w-[14px] rounded-t-sm transition-all ${d.hasData ? 'bg-[#3bd1d3]' : 'bg-[#e5e7eb]'}`} style={{ height: `${d.h2}%` }} />
          </div>
        ))}
      </div>
      
      {/* Months */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 border-t border-[#eceef1] pt-1.5">
        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
          <div key={m} className="flex-1 text-center text-[10px] text-[#393a3d]">
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
            <tr className="border-b border-[#eceef1] border-dashed">
              <td className="py-2 truncate max-w-[100px]">Product name</td>
              <td className="py-2 text-right">--</td>
              <td className="py-2 text-right">Reorder</td>
            </tr>
            <tr className="border-b border-[#eceef1] border-dashed">
              <td className="py-2 truncate max-w-[100px]">Product name</td>
              <td className="py-2 text-right">--</td>
              <td className="py-2 text-right">Reorder</td>
            </tr>
            <tr>
              <td className="py-2 text-[#8d9096]">--</td>
              <td className="py-2"></td>
              <td className="py-2"></td>
            </tr>
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
        <div className="flex flex-col gap-4 py-2 mt-2">
          <div>
            <div className="flex justify-between text-[11px] font-bold text-[#393a3d] mb-1">
              <span>LRs0 Unpaid <span className="font-normal text-[#6b6c72] ml-1">Last 365 days</span></span>
            </div>
            <div className="flex gap-1 h-[20px] mt-7">
              <div className="w-1/2 bg-[#e33e07] rounded-l-sm relative">
                <span className="absolute -top-6 left-0 text-[14px] font-bold text-[#393a3d]">LRs0</span>
                <span className="absolute top-6 left-0 text-[11px] text-[#6b6c72]">Overdue</span>
              </div>
              <div className="w-1/2 bg-[#d4d7dc] rounded-r-sm relative">
                <span className="absolute -top-6 right-0 text-[14px] font-bold text-[#393a3d]">LRs0</span>
                <span className="absolute top-6 right-0 text-[11px] text-[#6b6c72]">Not due yet</span>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <div className="flex justify-between text-[11px] font-bold text-[#393a3d] mb-1">
              <span>LRs0 Paid <span className="font-normal text-[#6b6c72] ml-1">Last 30 days</span></span>
            </div>
            <div className="flex gap-1 h-[20px] mt-7">
              <div className="w-1/2 bg-[#2ca01c] rounded-l-sm opacity-80 relative">
                <span className="absolute -top-6 left-0 text-[14px] font-bold text-[#393a3d]">LRs0</span>
                <span className="absolute top-6 left-0 text-[11px] text-[#6b6c72]">Not deposited</span>
              </div>
              <div className="w-1/2 bg-[#2ca01c] rounded-r-sm relative">
                <span className="absolute -top-6 right-0 text-[14px] font-bold text-[#393a3d]">LRs0</span>
                <span className="absolute top-6 right-0 text-[11px] text-[#6b6c72]">Deposited</span>
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
        <div className="absolute top-4 right-4 text-[11px] text-[#6b6c72]">As of today</div>
        <div className="flex items-center justify-between gap-1 overflow-x-auto py-2 h-full mt-4 pb-4">
          {[
            { label: 'Open opportunities', val: '0', color: '#6ee7b7' },
            { label: 'Open estimates', val: '0', color: '#34d399' },
            { label: 'Open contracts', val: '0', color: '#10b981' },
            { label: 'In progress projects', val: '0', color: '#059669' },
            { label: 'Unpaid invoices', val: '0', color: '#047857' },
            { label: 'Reviews', val: '0', color: '#064e3b' },
          ].map((f, i, arr) => (
            <React.Fragment key={i}>
              <div className="border border-[#d4d7dc] rounded-md flex flex-col min-w-[110px] flex-1 shrink-0 h-[100px] overflow-hidden relative shadow-sm">
                <div className="h-2 w-full shrink-0" style={{ backgroundColor: f.color }} />
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <span className="text-[12px] text-[#393a3d] leading-tight">{f.label}</span>
                  <span className="text-[20px] font-bold text-[#393a3d]">{f.val}</span>
                </div>
              </div>
              {i < arr.length - 1 && <ChevronRight size={14} className="text-[#8d9096] shrink-0" />}
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
        <div className="text-[20px] font-bold text-[#393a3d] mb-4">LRs0</div>
        <div className="relative h-[80px] border-l border-[#d4d7dc] flex items-end ml-4 mt-6">
          <div className="absolute -left-5 bottom-[0%] text-[10px] text-[#8d9096]">0</div>
          <div className="absolute -left-6 bottom-[25%] text-[10px] text-[#8d9096]">0.1</div>
          <div className="absolute -left-6 bottom-[50%] text-[10px] text-[#8d9096]">0.2</div>
          <div className="absolute -left-6 bottom-[75%] text-[10px] text-[#8d9096]">0.3</div>
          <div className="absolute -left-6 bottom-[100%] text-[10px] text-[#8d9096]">0.4</div>
          {[0, 25, 50, 75, 100].map(p => (
            <div key={p} className="absolute left-0 right-0 border-t border-[#eceef1]" style={{ bottom: `${p}%` }} />
          ))}
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
        <div className="text-[20px] font-bold text-[#393a3d] mb-4">LRs0</div>
        <div className="flex items-center gap-6 mt-4">
          <div className="relative w-[70px] h-[70px] rounded-full border-[12px] border-[#d4d7dc] shrink-0" />
          <div className="text-[11px] space-y-1.5 text-[#393a3d]">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#2ca01c]"/>Current: LRs0</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#0078d4]"/>1 - 30: LRs0</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#7c3aed]"/>31 - 60: LRs0</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#0d9488]"/>61 - 90: LRs0</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#e33e07]"/>91 and over: LRs0</div>
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
        <div className="text-[20px] font-bold text-[#393a3d] mb-4">LRs0</div>
        <div className="flex items-center gap-6 mt-4">
          <div className="relative w-[70px] h-[70px] rounded-full border-[12px] border-[#d4d7dc] shrink-0" />
          <div className="text-[11px] space-y-1.5 text-[#393a3d]">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#2ca01c]"/>Current: LRs0</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#0078d4]"/>1 - 30: LRs0</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#7c3aed]"/>31 - 60: LRs0</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#0d9488]"/>61 - 90: LRs0</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#e33e07]"/>91 and over: LRs0</div>
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
            <tr className="border-b border-[#eceef1] border-dashed">
              <td className="py-2">SO</td>
              <td className="py-2 text-center">--</td>
              <td className="py-2 text-right">--</td>
            </tr>
            <tr className="border-b border-[#eceef1] border-dashed">
              <td className="py-2">SO</td>
              <td className="py-2 text-center">--</td>
              <td className="py-2 text-right">--</td>
            </tr>
            <tr>
              <td className="py-2 text-[#8d9096]">...</td>
              <td className="py-2"></td>
              <td className="py-2"></td>
            </tr>
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
        <div className="border border-[#0078d4] bg-[#f4f8fc] rounded-md p-3 text-[12px] text-[#393a3d] flex gap-2 mt-4 shadow-sm">
          <Info size={16} className="text-[#0078d4] shrink-0 mt-0.5 fill-[#0078d4] text-white" />
          <div className="leading-relaxed">
            'Reviews' question is off and is no longer collecting reviews. To collect responses, enable the 'Reviews' question in <a href="#" className="text-[#0078d4] hover:underline">survey settings</a>.
          </div>
        </div>
        <div className="bg-[#f4f5f8] flex-1 mt-4 rounded-md border border-[#eceef1]" />
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
          You have LRs0.00 in invoices that are overdue.
        </div>
        <div className="text-[12px] text-[#6b6c72] mt-2">
          Create an invoice for your next job!
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
        <div className="grid grid-cols-2 gap-4 mt-4 h-full pb-4">
          <div className="flex flex-col gap-2">
            <div 
              className="relative w-full rounded-lg overflow-hidden bg-[#e0e3e8] aspect-video group cursor-pointer flex items-center justify-center border border-[#eceef1] shadow-sm hover:shadow-md transition-shadow"
              onClick={() => setVideoOpen('get_started')}
            >
              <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80" alt="Thumbnail 1" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center z-10 text-[#2ca01c] group-hover:scale-110 transition-transform">
                <Play size={18} fill="currentColor" className="ml-0.5" />
              </div>
            </div>
            <div className="text-[12px] font-bold text-[#393a3d] leading-snug">Getting started with ONIMTA Accounts</div>
          </div>
          <div className="flex flex-col gap-2">
            <div 
              className="relative w-full rounded-lg overflow-hidden bg-[#e0e3e8] aspect-video group cursor-pointer flex items-center justify-center border border-[#eceef1] shadow-sm hover:shadow-md transition-shadow"
              onClick={() => setVideoOpen('track_expenses')}
            >
              <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80" alt="Thumbnail 2" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center z-10 text-[#2ca01c] group-hover:scale-110 transition-transform">
                <Play size={18} fill="currentColor" className="ml-0.5" />
              </div>
            </div>
            <div className="text-[12px] font-bold text-[#393a3d] leading-snug">How to track your expenses efficiently</div>
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
