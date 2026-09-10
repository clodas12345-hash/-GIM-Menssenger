import React, { useState } from 'react';
import { Settings, X, Check, Globe, Volume2, ShieldCheck, Link2, Smartphone, Plus, Trash2, MessageCircle, Save, AlertTriangle, Lock, Unlock, ShieldAlert, Shield } from 'lucide-react';
import { AppSettings, WhatsAppChip, DispatchLogItem } from '../types';
import { cleanChipName } from '../utils/whatsapp';
import { safeConfirm } from '../utils/whatsapp';

interface SettingsModalProps {
  logs?: DispatchLogItem[];
  onReportBlocked24h?: () => void;
  onUnblockWhatsApp?: () => void;
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onOpenSaveAndReset?: () => void;
  onOpenPermissions?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onOpenSaveAndReset,
  onOpenPermissions,
  logs = [],
  onReportBlocked24h,
  onUnblockWhatsApp,
}) => {
  const [defaultCountryCode, setDefaultCountryCode] = useState<string>(settings.defaultCountryCode || '55');
  const [defaultIntervalSeconds, setDefaultIntervalSeconds] = useState<number>(settings.defaultIntervalSeconds || 8);
  const [maxMessagesPer24Hours, setMaxMessagesPer24Hours] = useState<number>(settings.maxMessagesPer24Hours || 100);
  const [sendMode, setSendMode] = useState<'whatsapp_desktop' | 'webhook'>(settings.sendMode === 'webhook' ? 'webhook' : 'whatsapp_desktop');
  const [webhookUrl, setWebhookUrl] = useState<string>(settings.webhookUrl || '');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(settings.soundEnabled ?? true);
  const [enableSendingRules, setEnableSendingRules] = useState<boolean>(settings.enableSendingRules ?? true);
  const [ruleNighttime, setRuleNighttime] = useState<boolean>(settings.ruleNighttime ?? true);
  const [ruleDailyLimit, setRuleDailyLimit] = useState<boolean>(settings.ruleDailyLimit ?? true);
  const [ruleSundayAlert, setRuleSundayAlert] = useState<boolean>(settings.ruleSundayAlert ?? true);
  const [ruleDoubleMessage, setRuleDoubleMessage] = useState<boolean>(settings.ruleDoubleMessage ?? true);
  const [mentorName, setMentorName] = useState<string>(settings.mentorName || 'Cláudio');
  const [defaultFunnel, setDefaultFunnel] = useState<string>(settings.defaultFunnel || 'all');
  const [hideContactedToday, setHideContactedToday] = useState<boolean>(settings.hideContactedToday ?? false);
  const [sortSkippedFirst, setSortSkippedFirst] = useState<boolean>(settings.sortSkippedFirst ?? true);
  const [sortThreeDaysUnsentFirst, setSortThreeDaysUnsentFirst] = useState<boolean>(settings.sortThreeDaysUnsentFirst ?? true);
  const [sortOldestContactedFirst, setSortOldestContactedFirst] = useState<boolean>(settings.sortOldestContactedFirst ?? true);
  const [showOnlySkipped, setShowOnlySkipped] = useState<boolean>(settings.showOnlySkipped ?? false);
  const [hideAlreadyScheduled, setHideAlreadyScheduled] = useState<boolean>(settings.hideAlreadyScheduled ?? false);

  const [chips, setChips] = useState<WhatsAppChip[]>(settings.chips || [
    { id: 'chip_1', name: 'Business', active: true, color: '#D4AF37' },
    { id: 'chip_2', name: 'Support', active: false, color: '#3B82F6' }
  ]);
  const [activeChipId, setActiveChipId] = useState<string>(settings.activeChipId || 'chip_1');
  const [newChipName, setNewChipName] = useState<string>('');

  const activeChip = settings.chips?.find(c => c.id === activeChipId);
  const maxLimit = activeChip?.dailyLimit || settings.maxMessagesPer24Hours || 100;
  
  const isBlocked24h = !!(settings.blockedUntil && new Date(settings.blockedUntil).getTime() > Date.now());
  const blockedUntilDate = settings.blockedUntil ? new Date(settings.blockedUntil) : null;
  const blockedTimeStr = blockedUntilDate ? blockedUntilDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
  const blockedDateStr = blockedUntilDate ? blockedUntilDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '';
  
  const nowMs = Date.now();
  const twentyFourHoursAgoMs = nowMs - 24 * 60 * 60 * 1000;
  const sentLast24H = logs.filter((l) => {
    if (l.status !== 'enviado' || !l.sentAt) return false;
    if (activeChip && l.chipId && l.chipId !== activeChip.id) return false;
    const sentTime = new Date(l.sentAt).getTime();
    return !isNaN(sentTime) && sentTime >= twentyFourHoursAgoMs;
  }).length;
  
  const remaining = Math.max(0, maxLimit - sentLast24H);
  const isLimitReached = sentLast24H >= maxLimit;


  if (!isOpen) return null;

  const handleAddChip = () => {
    if (!newChipName.trim()) {
      alert('Preencha o nome do chip.');
      return;
    }
    const newChip: WhatsAppChip = {
      id: `chip_${Date.now()}`,
      name: newChipName.trim(),
      active: chips.length === 0,
      dailyLimit: maxMessagesPer24Hours,
      color: '#A88B4B'
    };
    const updated = [...chips, newChip];
    setChips(updated);
    if (!activeChipId && updated.length > 0) {
      setActiveChipId(newChip.id);
    }
    setNewChipName('');
  };

  const handleDeleteChip = (id: string) => {
    if (chips.length <= 1) {
      alert('Você precisa manter pelo menos um chip cadastrado.');
      return;
    }
    const updated = chips.filter(c => c.id !== id);
    setChips(updated);
    if (activeChipId === id && updated.length > 0) {
      setActiveChipId(updated[0].id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      defaultCountryCode: defaultCountryCode.trim() || '55',
      defaultIntervalSeconds: Number(defaultIntervalSeconds) || 8,
      maxMessagesPer24Hours: Number(maxMessagesPer24Hours) || 50,
      sendMode,
      webhookUrl: webhookUrl.trim() || undefined,
      soundEnabled,
      autoOpenTab: true,
      enableSendingRules,
      ruleNighttime,
      ruleDailyLimit,
      ruleSundayAlert,
      ruleDoubleMessage,
      mentorName: mentorName.trim(),
      chips,
      activeChipId,
      defaultFunnel,
      hideContactedToday,
      sortSkippedFirst,
      sortThreeDaysUnsentFirst,
      sortOldestContactedFirst,
      showOnlySkipped,
      hideAlreadyScheduled,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/85 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto pt-2 sm:pt-6 pb-6">
      <div className="bg-[#15181E] border border-[#2A2D35] rounded-2xl w-full max-w-lg text-gray-100 shadow-2xl overflow-hidden max-h-[94vh] flex flex-col my-auto">
        {/* Sticky Header */}
        <div className="flex items-center justify-between border-b border-[#1F2229] p-4 sm:p-5 bg-[#12141A] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D23] flex items-center justify-center text-black shadow-md">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif italic text-white text-base sm:text-lg font-bold leading-tight">Configurações do ZapAgendador</h3>
              <p className="text-[11px] text-gray-400">Preferências, chips, limites e regras</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Form Content */}
          <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                Nome do Mentor / Remetente (Preenchimento Automático)
              </label>
              <input
                type="text"
                required
                value={mentorName}
                onChange={(e) => setMentorName(e.target.value)}
                placeholder="Ex: Cláudio"
                className="w-full bg-[#0A0C10] border border-[#1F2229] rounded p-2.5 text-xs text-gray-200 focus:outline-none focus:border-[#A88B4B]"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Substitui as variáveis de assinatura nos modelos como [Nome do Anjo], [Nome do Mentor] ou [Mentor] automaticamente.
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
              Filtro Padrão de Envios (Funil) - Ativo Ocultamente
            </label>
            <select
              value={defaultFunnel}
              onChange={(e) => setDefaultFunnel(e.target.value)}
              className="w-full bg-[#0A0C10] border border-[#1F2229] rounded p-2.5 text-xs text-gray-200 focus:outline-none focus:border-[#A88B4B]"
            >
              <option value="all">🎯 Todos Envios (Sem filtro de número de envios)</option>
              <option value="0º Envio">0 Envios</option>
              <option value="1º Envio">1 Envios</option>
              <option value="2º Envio">2 Envios</option>
              <option value="3º Envio">3 Envios</option>
              <option value="4+ Envios">4+ Envios</option>
            </select>
            <p className="text-[10px] text-gray-500 mt-1">
              Filtra automaticamente os contatos por quantidade de envios anteriores ao criar campanhas, sem exibir a tela de seleção.
            </p>
          </div>

          <div className="bg-[#0A0C10] border border-[#1F2229] rounded-xl p-4 space-y-3">
            <span className="text-[#A88B4B] font-bold uppercase tracking-wider text-[10px] block">
              Priorização de Contatos (Agenda) - Ativo Ocultamente
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center space-x-2 cursor-pointer text-gray-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={hideContactedToday}
                  onChange={(e) => setHideContactedToday(e.target.checked)}
                  className="rounded bg-[#15181E] border-[#1F2229] text-[#A88B4B]"
                />
                <span>Ocultar Enviados Hoje</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer text-gray-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={sortSkippedFirst}
                  onChange={(e) => setSortSkippedFirst(e.target.checked)}
                  className="rounded bg-[#15181E] border-[#1F2229] text-[#A88B4B]"
                />
                <span>Fixar Contatos Pulados no Topo</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer text-gray-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={sortThreeDaysUnsentFirst}
                  onChange={(e) => setSortThreeDaysUnsentFirst(e.target.checked)}
                  className="rounded bg-[#15181E] border-[#1F2229] text-[#A88B4B]"
                />
                <span>Fixar Sem Envio &gt; 3d no Topo</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer text-gray-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={sortOldestContactedFirst}
                  onChange={(e) => setSortOldestContactedFirst(e.target.checked)}
                  className="rounded bg-[#15181E] border-[#1F2229] text-[#A88B4B]"
                />
                <span>Mais Antigos Enviados 1º</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer text-gray-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={showOnlySkipped}
                  onChange={(e) => setShowOnlySkipped(e.target.checked)}
                  className="rounded bg-[#15181E] border-[#1F2229] text-[#A88B4B]"
                />
                <span>Apenas Pulados</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer text-gray-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={hideAlreadyScheduled}
                  onChange={(e) => setHideAlreadyScheduled(e.target.checked)}
                  className="rounded bg-[#15181E] border-[#1F2229] text-[#A88B4B]"
                />
                <span>Ocultar Já Agendados</span>
              </label>
            </div>
            <p className="text-[10px] text-gray-500">
              Essas regras de ordenação e ocultação são aplicadas automaticamente ao preparar campanhas sem poluir a interface principal.
            </p>
          </div>


          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
              Código de País Padrão (Ex: 55 para Brasil)
            </label>
            <input
              type="text"
              value={defaultCountryCode}
              onChange={(e) => setDefaultCountryCode(e.target.value)}
              placeholder="55"
              className="w-full bg-[#0A0C10] border border-[#1F2229] rounded p-2.5 text-xs text-gray-200 focus:outline-none focus:border-[#A88B4B] font-mono"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Adicionado automaticamente a números curtos importados sem código de país.
            </p>
          </div>

          

          
          {/* LIMITADOR E GESTÃO (24H) - Integrated Widget */}
          <div className={`border rounded-xl p-4 transition-all shadow-md ${
            isBlocked24h
              ? 'bg-red-950/40 border-red-600/60'
              : isLimitReached
               ? 'bg-red-950/20 border-red-500/40'
               : 'bg-[#0A0C10] border-[#1F2229]'
          }`}>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-lg shrink-0 ${
                  isBlocked24h ? 'bg-red-500/30 text-red-300' : isLimitReached ? 'bg-red-500/20 text-red-400' : 'bg-[#A88B4B]/10 text-[#A88B4B]'
                }`}>
                  {isBlocked24h ? <ShieldAlert className="w-5 h-5" /> : isLimitReached ? <AlertTriangle className="w-5 h-5 animate-pulse" /> : <AlertTriangle className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Limitador e Gestão (24h)
                  </h4>
                  <span className={`inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    isBlocked24h ? 'bg-red-600 text-white' : isLimitReached ? 'bg-red-500 text-white animate-pulse' : 'bg-[#A88B4B] text-[#0A0C10]'
                  }`}>
                    {isBlocked24h ? '🚫 Bloqueado 24h' : isLimitReached ? 'Limite Atingido!' : `${remaining} restantes`}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-400 mb-4">
              {isBlocked24h
                ? `🚫 A rotina de disparos está pausada por 24 horas para proteção do chip. Libera em ${blockedDateStr} às ${blockedTimeStr}.`
                : isLimitReached
                 ? `⚠️ Você atingiu o limite de ${maxLimit} mensagens nas últimas 24 horas. Para evitar bloqueios no WhatsApp, os envios estão pausados.`
                 : `Você já enviou ${sentLast24H} de ${maxLimit} mensagens permitidas nas últimas 24h.`}
            </div>

            <div className="flex flex-col gap-3">
              {isBlocked24h && onUnblockWhatsApp && (
                <button
                  type="button"
                  onClick={onUnblockWhatsApp}
                  className="w-full bg-red-950 hover:bg-red-900 text-white font-bold py-2.5 rounded border border-red-500 text-xs transition-all flex items-center justify-center space-x-2"
                >
                  <Unlock className="w-4 h-4 text-emerald-400" />
                  <span>Desbloquear Manualmente Agora</span>
                </button>
              )}

              {onReportBlocked24h && !isBlocked24h && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Marcar que seu WhatsApp foi bloqueado? O sistema pausará todos os envios por 24 horas.')) {
                      onReportBlocked24h();
                    }
                  }}
                  className="w-full bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-700/80 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-md"
                >
                  <Lock className="w-4 h-4 text-red-400" />
                  <span>Fui Bloqueado (Pausar Envios 24h)</span>
                </button>
              )}

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                  Limite de Envios a cada 24 horas
                </label>
                <select
                  value={maxMessagesPer24Hours}
                  onChange={(e) => setMaxMessagesPer24Hours(Number(e.target.value))}
                  className="w-full bg-[#15181E] border border-[#2A2D35] rounded p-2 text-xs text-gray-200 focus:outline-none focus:border-[#A88B4B] font-mono font-bold"
                >
                  <option value={50}>50 mensagens dentro de 24 horas</option>
                  <option value={60}>60 mensagens dentro de 24 horas</option>
                  <option value={70}>70 mensagens dentro de 24 horas</option>
                  <option value={80}>80 mensagens dentro de 24 horas</option>
                  <option value={90}>90 mensagens dentro de 24 horas</option>
                  <option value={100}>100 mensagens dentro de 24 horas</option>
                  <option value={120}>120 mensagens dentro de 24 horas</option>
                  <option value={150}>150 mensagens dentro de 24 horas</option>
                </select>
                <p className="text-[10px] text-gray-500 mt-1">
                  O sistema pausará os disparos automaticamente se este limite for atingido.
                </p>
              </div>
            </div>
          </div>


          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
              Modo de Disparo do WhatsApp
            </label>
            <select
              value={sendMode}
              onChange={(e) => setSendMode(e.target.value as any)}
              className="w-full bg-[#0A0C10] border border-[#1F2229] rounded p-2.5 text-xs text-gray-200 focus:outline-none focus:border-[#A88B4B]"
            >
              <option value="whatsapp_desktop">📱 Aplicativo WhatsApp (App Nativo / Desktop)</option>
              <option value="webhook">⚡ Webhook API Customizado (Evolution / Z-API / Server)</option>
            </select>
          </div>

          {sendMode === 'webhook' && (
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                URL do Webhook do WhatsApp Server
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://seu-servidor.com/api/send-message"
                className="w-full bg-[#0A0C10] border border-[#1F2229] rounded p-2.5 text-xs text-gray-200 focus:outline-none focus:border-[#A88B4B] font-mono"
              />
            </div>
          )}

          <div className="pt-2 space-y-2">
            <label className="flex items-center space-x-2 text-xs font-semibold text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="rounded bg-[#0A0C10] border-[#1F2229] text-[#A88B4B] focus:ring-0"
              />
              <span className="text-xs text-gray-300">Ativar Efeitos Sonoros & Sinais Sonoros de Disparo</span>
            </label>

            <label className="flex items-center space-x-2 text-xs font-semibold text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={enableSendingRules}
                onChange={(e) => setEnableSendingRules(e.target.checked)}
                className="rounded bg-[#0A0C10] border-[#1F2229] text-[#A88B4B] focus:ring-0"
              />
              <span className="text-xs text-gray-300">Ativar Sistema de Regras de Envio</span>
            </label>

            {enableSendingRules && (
              <div className="ml-6 pl-3 border-l-2 border-[#A88B4B]/30 space-y-2 py-1">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Selecione quais regras estão vigentes:</p>
                
                <label className="flex items-center space-x-2 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ruleNighttime}
                    onChange={(e) => setRuleNighttime(e.target.checked)}
                    className="rounded bg-[#0A0C10] border-[#1F2229] text-[#A88B4B] focus:ring-0"
                  />
                  <span>Bloqueio Noturno (20h às 08h)</span>
                </label>

                <label className="flex items-center space-x-2 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ruleDailyLimit}
                    onChange={(e) => setRuleDailyLimit(e.target.checked)}
                    className="rounded bg-[#0A0C10] border-[#1F2229] text-[#A88B4B] focus:ring-0"
                  />
                  <span>Limite Diário de Mensagens (24h)</span>
                </label>

                <label className="flex items-center space-x-2 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ruleSundayAlert}
                    onChange={(e) => setRuleSundayAlert(e.target.checked)}
                    className="rounded bg-[#0A0C10] border-[#1F2229] text-[#A88B4B] focus:ring-0"
                  />
                  <span>Alerta de Confirmação aos Domingos</span>
                </label>

                <label className="flex items-center space-x-2 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ruleDoubleMessage}
                    onChange={(e) => setRuleDoubleMessage(e.target.checked)}
                    className="rounded bg-[#0A0C10] border-[#1F2229] text-[#A88B4B] focus:ring-0"
                  />
                  <span>Alerta de Dupla Mensagem (Mesmo Contato no Dia)</span>
                </label>
              </div>
            )}
          </div>

          <div className="bg-[#0A0C10] border border-[#1F2229] rounded-xl p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-[#D4AF37]" />
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Permissões & Dispositivo</h4>
            </div>
            <p className="text-[10px] text-gray-400">
              Notificações de disparo, Câmera, Agenda de contatos, Microfone e Memória Blindada anti-limpeza.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenPermissions) onOpenPermissions();
              }}
              className="w-full bg-[#D4AF37]/20 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black font-bold py-2.5 px-3 rounded-lg border border-[#D4AF37]/40 transition-all text-xs uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>Gerenciar Permissões & Dispositivo</span>
            </button>
          </div>

          <div className="bg-[#0A0C10] border border-[#1F2229] rounded-xl p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Suporte e Sugestões</h4>
            </div>
            <p className="text-[10px] text-gray-400">
              Tem alguma dúvida ou sugestão para o aplicativo GKD Messenger? Envie uma mensagem direta para o suporte.
            </p>
            <button
              type="button"
              onClick={() => {
                const text = encodeURIComponent("Olá! Tenho uma sugestão para o aplicativo GKD Messenger:");
                window.open(`https://wa.me/5511953292570?text=${text}`, '_blank');
              }}
              className="w-full bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-bold py-2.5 px-3 rounded-lg border border-emerald-500/40 transition-all text-xs uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Fale Conosco / Enviar Sugestão (WhatsApp)</span>
            </button>
          </div>

          <div className="bg-[#0A0C10] border border-[#1F2229] rounded-xl p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Save className="w-4 h-4 text-amber-400" />
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Salvar & Zerar Dados</h4>
            </div>
            <p className="text-[10px] text-gray-400">
              Gerencie seus backups ou resete o aplicativo para o padrão.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenSaveAndReset) onOpenSaveAndReset();
              }}
              className="w-full bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-bold py-2.5 px-3 rounded-lg border border-amber-500/40 transition-all text-xs uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Abrir Central de Dados</span>
            </button>
          </div>


          </div>

          {/* Sticky Footer */}
          <div className="p-4 border-t border-[#1F2229] bg-[#12141A] shrink-0 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                if (safeConfirm('Deseja realmente cancelar as alterações?')) {
                  onClose();
                }
              }}
              className="px-4 py-2 rounded-lg text-gray-400 hover:text-white text-xs hover:bg-[#1A1D23] font-semibold uppercase tracking-wider transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B38F2C] hover:from-[#E5C365] hover:to-[#C9A238] text-black font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#D4AF37]/20 flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Salvar Configurações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
