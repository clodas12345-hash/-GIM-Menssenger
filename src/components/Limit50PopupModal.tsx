import React from 'react';
import { AlertTriangle, ShieldAlert, Smartphone, Settings as SettingsIcon, FileText, CheckCircle, X, Clock } from 'lucide-react';
import { DispatchLogItem, AppSettings } from '../types';
import { cleanChipName, calculateChipReleaseTimes, formatReleaseTime } from '../utils/whatsapp';

interface Limit50PopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  sentLast24HoursCount: number;
  logs: DispatchLogItem[];
  settings: AppSettings;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
}

export const Limit50PopupModal: React.FC<Limit50PopupModalProps> = ({
  isOpen,
  onClose,
  sentLast24HoursCount,
  logs,
  settings,
  onOpenSettings,
  onOpenHistory,
}) => {
  if (!isOpen) return null;

  const now = Date.now();
  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

  // Breakdown by chip in last 24h
  const logsLast24h = logs.filter(
    (l) => l.status === 'enviado' && l.sentAt && new Date(l.sentAt).getTime() >= twentyFourHoursAgo
  );

  const chipCounts: Record<string, { name: string; count: number }> = {};
  logsLast24h.forEach((l) => {
    const chipId = l.chipId || 'default';
    const chipName = l.chipName ? cleanChipName(l.chipName) : (chipId === 'default' ? 'Business' : cleanChipName(chipId));
    if (!chipCounts[chipId]) {
      chipCounts[chipId] = { name: chipName, count: 0 };
    }
    chipCounts[chipId].count += 1;
  });

  return (
    <div className="fixed inset-0 bg-black/85 z-[100] flex items-center justify-center p-4">
      <div className="bg-[#15181E] border-2 border-[#A88B4B] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#A88B4B]/20 via-[#15181E] to-[#15181E] border-b border-[#1F2229] p-5 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-[#A88B4B]/20 border border-[#A88B4B]/50 rounded-xl text-[#A88B4B] animate-pulse">
              <ShieldAlert className="w-7 h-7 text-[#A88B4B]" />
            </div>
            <div>
              <h3 className="text-lg font-serif italic text-white font-bold flex items-center gap-2">
                <span>Alerta de Limite Diário</span>
                <span className="text-[10px] font-mono font-bold bg-[#A88B4B] text-black px-2 py-0.5 rounded-full uppercase">
                  24h
                </span>
              </h3>
              <p className="text-xs text-amber-300/80 font-medium mt-0.5">
                50 ou mais mensagens enviadas nas últimas 24 horas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#1F2229] transition-all"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-gray-300 text-xs">
          {/* Big Metric Box */}
          <div className="bg-[#0A0C10] border border-[#A88B4B]/40 rounded-xl p-4 flex items-center justify-between shadow-inner">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">
                Total Enviado (Últimas 24h)
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-mono font-extrabold text-[#A88B4B]">
                  {sentLast24HoursCount}
                </span>
                <span className="text-xs text-gray-400 font-semibold">/ 50+ mensagens</span>
              </div>
            </div>
            <div className="p-2.5 bg-[#A88B4B]/10 rounded-lg border border-[#A88B4B]/20 text-[#A88B4B]">
              <Clock className="w-6 h-6 text-[#A88B4B]" />
            </div>
          </div>

          {/* Warning Banner */}
          <div className="bg-amber-950/40 border border-amber-500/40 p-3.5 rounded-xl flex items-start space-x-3 text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-amber-300">Recomendação de Seguranca do WhatsApp</p>
              <p className="text-[11px] leading-relaxed opacity-90">
                Você atingiu <strong className="text-white">{sentLast24HoursCount} mensagens enviadas</strong> nas últimas 24 horas. Para prevenir bloqueios automáticos do seu número pelo algoritmo da META, é altamente recomendado alternar o chip de envio ou pausar os disparos por algumas horas.
              </p>
            </div>
          </div>

          {/* Chip Breakdown */}
          {Object.keys(chipCounts).length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-gray-200 uppercase tracking-wider flex items-center space-x-1.5">
                <Smartphone className="w-4 h-4 text-[#A88B4B]" />
                <span>Distribuição por Chip (Últimas 24h):</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(chipCounts).map(([chipId, item]) => {
                  const chipsList = settings.chips || [];
                  const chipObj = chipsList.find(c => c.id === chipId);
                  const limit = chipObj?.dailyLimit || settings.maxMessagesPer24Hours || 50;
                  const releaseInfo = calculateChipReleaseTimes(logs, chipId, item.name, limit);
                  
                  const timesDetail = releaseInfo.canSendTime 
                    ? (item.count > limit && releaseInfo.nextDecreaseTime
                        ? `Diminui: ${formatReleaseTime(releaseInfo.nextDecreaseTime)} | Pode enviar: ${formatReleaseTime(releaseInfo.canSendTime)}`
                        : `Pode enviar: ${formatReleaseTime(releaseInfo.canSendTime)}`
                      )
                    : (releaseInfo.nextDecreaseTime ? `Diminui: ${formatReleaseTime(releaseInfo.nextDecreaseTime)}` : '');

                  return (
                    <div
                      key={chipId}
                      className="bg-[#0A0C10] border border-[#1F2229] p-3 rounded-lg flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-300 truncate">📱 {item.name}</span>
                        <span className="font-mono font-bold text-[#A88B4B] bg-[#15181E] border border-[#1F2229] px-2 py-0.5 rounded text-[11px]">
                          {item.count} / {limit} msgs
                        </span>
                      </div>
                      {timesDetail && (
                        <div className="text-[11px] text-amber-300/95 font-semibold flex items-center gap-1.5 bg-[#15181E]/60 p-2 rounded border border-[#A88B4B]/10">
                          <Clock className="w-3.5 h-3.5 text-[#A88B4B] shrink-0" />
                          <span className="leading-tight">{timesDetail}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dicas de Proteção */}
          <div className="bg-[#0A0C10] border border-[#1F2229] p-3.5 rounded-xl space-y-2">
            <span className="font-bold text-white text-[11px] uppercase tracking-wider block">
              💡 Ações Recomendadas:
            </span>
            <ul className="space-y-1.5 text-gray-400 text-[11px]">
              <li className="flex items-center space-x-2">
                <span className="text-[#A88B4B] font-bold">•</span>
                <span><strong>Trocar de Chip:</strong> Use o botão de Configurações para alternar o chip padrão.</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-[#A88B4B] font-bold">•</span>
                <span><strong>Aumentar Intervalo:</strong> Defina um delay de 25 a 45 segundos entre disparos.</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-[#A88B4B] font-bold">•</span>
                <span><strong>Histórico por Hora:</strong> Verifique o volume de envios por horário no painel de Histórico.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-[#0A0C10] border-t border-[#1F2229] p-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onOpenSettings();
                onClose();
              }}
              className="bg-[#1F2229] hover:bg-[#2A2D35] text-gray-200 border border-gray-700/60 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              <SettingsIcon className="w-3.5 h-3.5 text-[#A88B4B]" />
              <span>Configurar Chips</span>
            </button>
            <button
              onClick={() => {
                onOpenHistory();
                onClose();
              }}
              className="bg-[#1F2229] hover:bg-[#2A2D35] text-gray-200 border border-gray-700/60 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-[#A88B4B]" />
              <span>Ver Histórico por Hora</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="bg-[#A88B4B] hover:bg-[#C5A968] text-slate-950 font-bold px-4 py-2 rounded-lg text-xs uppercase tracking-wider shadow-lg transition-all flex items-center space-x-1.5 ml-auto"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Ciente / Entendi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
