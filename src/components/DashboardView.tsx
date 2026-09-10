import React, { useMemo } from 'react';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  Clock, 
  Send, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  Play,
  Trash2,
  Sparkles,
  ArrowRight,
  Edit3,
  FastForward,
  Smartphone,
  ChevronDown,
  Bell,
  Activity
} from 'lucide-react';
import { Contact, MessageTemplate, ScheduledCampaign, DispatchLogItem, AppSettings } from '../types';
import { replaceTemplateVariables, safeConfirm } from '../utils/whatsapp';
import { getSettings } from '../utils/storage';
import { RealTimeCounter } from './RealTimeCounter';

interface DashboardViewProps {
  contacts: Contact[];
  templates: MessageTemplate[];
  campaigns: ScheduledCampaign[];
  logs: DispatchLogItem[];
  settings: AppSettings;
  isAppReady?: boolean;
  onNavigate: (tab: string) => void;
  onOpenNewCampaign: () => void;
  onOpenAiModal: () => void;
  onLaunchCampaign: (campaign: ScheduledCampaign) => void;
  onDeleteCampaign: (id: string) => void;
  onEditCampaign: (campaign: ScheduledCampaign) => void;
  onAdvanceCampaign?: (campaignId: string, minutes?: number) => void;
  onUpdateCampaign?: (campaign: ScheduledCampaign) => void;
  onResetChipLogs?: (chipId: string) => void;
  onResetAllChips?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = React.memo(({
  contacts,
  templates,
  campaigns,
  logs,
  settings,
  isAppReady = true,
  onNavigate,
  onOpenNewCampaign,
  onOpenAiModal,
  onLaunchCampaign,
  onDeleteCampaign,
  onEditCampaign,
  onAdvanceCampaign,
  onUpdateCampaign,
  onResetChipLogs,
  onResetAllChips,
}) => {
  const activeCampaigns = useMemo(() => {
    if (!isAppReady) return [];
    return campaigns.filter((c) => c.status === 'agendado' || c.status === 'em_andamento');
  }, [campaigns, isAppReady]);
  
  const sortedCampaigns = useMemo(() => {
    if (!isAppReady) return [];
    return [...campaigns].sort(
      (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );
  }, [campaigns, isAppReady]);
  
  const vcfContactsCount = useMemo(() => {
    if (!isAppReady) return 0;
    return contacts.filter((c) => c.source === 'vcf').length;
  }, [contacts, isAppReady]);
  
  const totalSent = useMemo(() => {
    if (!isAppReady) return 0;
    const currentSent = logs.filter((l) => l.status === 'enviado').length;
    return currentSent + (settings.historicalSentCount || 0);
  }, [logs, settings.historicalSentCount, isAppReady]);

  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Real Time Counter for Chips */}
      <div className="bg-[#15181E] border border-[#1F2229] rounded-xl p-4 shadow-xl">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="w-4 h-4 text-[#A88B4B]" />
          <h3 className="text-xs font-black text-white uppercase tracking-widest">Contador de Disparos em Tempo Real</h3>
        </div>
        <RealTimeCounter 
          logs={logs} 
          settings={settings} 
          onResetChip={onResetChipLogs}
          onResetAll={onResetAllChips}
        />
      </div>

      {activeCampaigns.length === 0 && (
        <div className="bg-[#15181E] border border-[#1F2229] rounded-xl p-8 text-center space-y-3">
          <div className="w-12 h-12 bg-[#0A0C10] text-[#A88B4B] border border-[#A88B4B]/30 rounded-full flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif italic text-white">Nenhum envio agendado pendente</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Agende suas mensagens para serem disparadas no horário certo para seus contatos ou grupos.
          </p>
          <button
            onClick={onOpenNewCampaign}
            className="inline-flex items-center space-x-2 bg-[#A88B4B] hover:bg-[#C5A968] text-[#0A0C10] font-bold px-5 py-2.5 rounded text-xs uppercase tracking-widest transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Primeiro Agendamento</span>
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigate('contacts')}
          className="bg-[#15181E] border border-[#1F2229] rounded-xl p-5 hover:border-[#A88B4B]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Total Contatos</span>
            <div className="p-2 rounded bg-[#0A0C10] text-[#A88B4B] border border-[#1F2229] group-hover:border-[#A88B4B]/40 transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-serif italic text-white mt-2">{contacts.length}</p>
          <p className="text-xs text-gray-500 mt-1">
            <span className="text-[#A88B4B] font-medium">{vcfContactsCount}</span> via importação rápida
          </p>
        </div>

        <div 
          onClick={() => onNavigate('templates')}
          className="bg-[#15181E] border border-[#1F2229] rounded-xl p-5 hover:border-[#A88B4B]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Modelos Prontos</span>
            <div className="p-2 rounded bg-[#0A0C10] text-[#A88B4B] border border-[#1F2229] group-hover:border-[#A88B4B]/40 transition-colors">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-serif italic text-white mt-2">{templates.length}</p>
          <p className="text-xs text-gray-500 mt-1">Mensagens personalizáveis</p>
        </div>

        <div 
          onClick={() => onNavigate('campaigns')}
          className="bg-[#15181E] border border-[#1F2229] rounded-xl p-5 hover:border-[#A88B4B]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Agendados</span>
            <div className="p-2 rounded bg-[#0A0C10] text-[#A88B4B] border border-[#1F2229] group-hover:border-[#A88B4B]/40 transition-colors">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-serif italic text-white mt-2">{activeCampaigns.length}</p>
          <p className="text-xs text-gray-500 mt-1">Campanhas ativas</p>
        </div>

        <div 
          onClick={() => onNavigate('history')}
          className="bg-[#15181E] border border-[#1F2229] rounded-xl p-5 hover:border-[#A88B4B]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Enviadas</span>
            <div className="p-2 rounded bg-[#0A0C10] text-emerald-400 border border-[#1F2229] group-hover:border-emerald-500/40 transition-colors">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-serif italic text-white mt-2">{totalSent}</p>
          <p className="text-xs text-gray-500 mt-1">Total disparado com sucesso</p>
        </div>
      </div>



      {/* Campaigns List Table */}
      <div className="bg-[#15181E] border border-[#1F2229] rounded-xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-[#1F2229] flex items-center justify-between bg-[#0F1115]">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-[#A88B4B]" />
            <h3 className="font-serif italic text-white text-lg">Todos os Agendamentos ({campaigns.length})</h3>
          </div>
          <button
            onClick={() => onNavigate('campaigns')}
            className="text-xs text-[#A88B4B] hover:text-[#C5A968] font-semibold uppercase tracking-wider flex items-center space-x-1"
          >
            <span>Ver Todos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {sortedCampaigns.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-xs">
            Nenhuma campanha cadastrada até o momento.
          </div>
        ) : (
          <div className="divide-y divide-[#1F2229]">
            {sortedCampaigns.map((camp, index) => {
              const total = camp.contactIds.length;
              const sent = camp.progress?.sent || 0;
              const percent = total > 0 ? Math.round((sent / total) * 100) : 0;

              return (
                <div 
                  key={camp.id} 
                  onDoubleClick={() => onEditCampaign(camp)}
                  title="Clique 2 vezes para editar este agendamento"
                  className="p-4 hover:bg-[#1A1D23] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none group"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#0A0C10] border border-[#2A2E39] text-[#D4AF37] font-mono">
                        #{index + 1}
                      </span>
                      <span className="font-medium text-white text-sm group-hover:text-[#A88B4B] transition-colors">{camp.title}</span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-widest ${
                          camp.status === 'agendado'
                            ? 'bg-[#A88B4B]/10 text-[#A88B4B] border border-[#A88B4B]/30'
                            : camp.status === 'em_andamento'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30 animate-pulse'
                            : camp.status === 'concluido'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {camp.status === 'agendado'
                          ? 'Agendado'
                          : camp.status === 'em_andamento'
                          ? 'Em Andamento'
                          : camp.status === 'concluido'
                          ? 'Concluído'
                          : 'Cancelado'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 line-clamp-1 italic">
                      "{camp.templateContent}"
                    </p>

                    <div className="flex items-center space-x-4 text-[11px] text-gray-500 pt-1 flex-wrap gap-y-1">
                      <span>Horário: <strong className="text-gray-300 font-mono">{new Date(camp.scheduledAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong></span>
                      <span>Destinatários: <strong className="text-gray-300">{total} contatos</strong></span>
                      <span>Enviadas: <strong className="text-emerald-400">{sent}</strong></span>
                      <span>Faltam: <strong className="text-amber-400">{Math.max(0, total - sent)}</strong></span>
                      {(camp.cardImageUrl || (camp.cardImageUrls && camp.cardImageUrls.length > 0)) && (
                        <span className="flex items-center space-x-1.5 bg-[#A88B4B]/10 text-[#A88B4B] px-2 py-0.5 rounded border border-[#A88B4B]/30 font-semibold">
                          <img src={camp.cardImageUrls?.[0] || camp.cardImageUrl} alt="" className="w-3.5 h-3.5 object-cover rounded" />
                          <span>{camp.cardImageUrls && camp.cardImageUrls.length > 1 ? `🎲 ${camp.cardImageUrls.length} Cards` : camp.cardTitle || 'Card'}</span>
                        </span>
                      )}
                    </div>
                  </div>

                    {/* Progress & Actions */}
                    <div className="flex items-center space-x-2 sm:space-x-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {deletingId === camp.id ? (
                        <div className="flex items-center space-x-2 bg-red-950/40 border border-red-500/30 p-1.5 rounded-lg animate-fadeIn">
                          <span className="text-[10px] font-bold text-red-200 uppercase px-1">Excluir?</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingId(null);
                            }}
                            className="px-2 py-1 bg-[#0A0C10] hover:bg-[#1A1D23] text-gray-300 rounded text-[10px] font-bold transition-all"
                          >
                            Não
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteCampaign(camp.id);
                              setDeletingId(null);
                            }}
                            className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold transition-all shadow-lg shadow-red-600/30"
                          >
                            Sim
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="w-28 sm:w-32 mr-2">
                            <div className="flex justify-between text-[10px] text-gray-500 mb-1 font-mono">
                              <span>Progresso</span>
                              <span className="text-[#A88B4B]">{sent}/{total} ({percent}%)</span>
                            </div>
                            <div className="w-full bg-[#0A0C10] h-1.5 rounded-full overflow-hidden border border-[#1F2229]">
                              <div
                                className="bg-[#A88B4B] h-full transition-all duration-300"
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                          </div>

                          {onAdvanceCampaign && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAdvanceCampaign(camp.id, 60);
                              }}
                              className="p-2 bg-[#0A0C10] hover:bg-[#A88B4B]/20 text-[#A88B4B] border border-[#1F2229] hover:border-[#A88B4B]/40 rounded text-xs font-semibold transition-all flex items-center space-x-1"
                              title="Adiantar envio em 1 hora (este e agendamentos subsequentes)"
                            >
                              <FastForward className="w-3.5 h-3.5 text-[#A88B4B]" />
                              <span className="hidden sm:inline">Adiantar 1h</span>
                            </button>
                          )}

                          <button
                            onClick={() => onEditCampaign(camp)}
                            className="p-2 bg-[#0A0C10] hover:bg-[#A88B4B]/20 text-gray-300 hover:text-[#A88B4B] border border-[#1F2229] hover:border-[#A88B4B]/40 rounded text-xs font-semibold transition-all flex items-center space-x-1"
                            title="Editar Agendamento (ou clique 2 vezes no item)"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#A88B4B]" />
                            <span className="hidden sm:inline">Editar</span>
                          </button>

                          <button
                            onClick={() => onLaunchCampaign(camp)}
                            className="p-2 bg-[#0A0C10] hover:bg-[#A88B4B] text-[#A88B4B] hover:text-[#0A0C10] border border-[#A88B4B]/30 rounded text-xs font-bold transition-all flex items-center space-x-1 uppercase tracking-widest"
                            title="Abrir Disparador"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span className="hidden sm:inline">Disparar</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setDeletingId(camp.id); 
                            }}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-[#15181E] rounded transition-colors cursor-pointer"
                            title="Excluir Agendamento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});
