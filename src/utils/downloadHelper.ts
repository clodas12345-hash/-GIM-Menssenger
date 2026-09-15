import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

export const downloadFileSafely = async (blob: Blob, filename: string) => {
  try {
    // Se estiver rodando como aplicativo nativo (APK/Capacitor)
    if (Capacitor.isNativePlatform()) {
      // 1. Converter Blob para Base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          // Extrai apenas a string base64, removendo o cabeçalho 'data:...'
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // 2. Salvar na pasta Documentos (Documents) do dispositivo
      await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Documents
      });

      alert(`✅ Arquivo salvo com sucesso na pasta 'Documentos' do seu celular!\n\nNome: ${filename}`);
      return;
    }

    // Comportamento padrão para Navegador/Web
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);

  } catch (error: any) {
    console.error("Erro no download nativo:", error);
    
    // Fallback de segurança: Se falhar (por ex, falta de permissão), tenta compartilhar
    if (navigator.canShare) {
      try {
        const file = new File([blob], filename, { type: blob.type });
        await navigator.share({
          files: [file],
          title: filename,
        });
      } catch (shareErr) {
        console.error("Fallback de compartilhamento falhou:", shareErr);
      }
    } else {
      alert("Erro ao salvar o arquivo. Verifique as permissões de armazenamento do aplicativo.");
    }
  }
};
