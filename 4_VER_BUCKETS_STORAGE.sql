-- VER BUCKETS DE STORAGE (IMAGENS/VÍDEOS)
SELECT
    id,
    name as nome_bucket,
    public as publico,
    file_size_limit as limite_tamanho,
    allowed_mime_types as tipos_permitidos
FROM storage.buckets
ORDER BY name;
