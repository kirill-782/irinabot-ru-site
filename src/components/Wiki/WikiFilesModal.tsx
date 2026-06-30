import React, { useCallback, useEffect, useState } from "react";
import { Button, Icon, List, Loader, Message, Modal } from "semantic-ui-react";
import { FileDto } from "../../models/rest/Wiki";
import { WikiService } from "../../services/WikiService";
import WikiFileImage, { formatFileSize } from "../WikiFileImage";

interface WikiFilesModalProps {
    open: boolean;
    api: WikiService;
    wiki: string;
    articleId: number;
    // удаление файлов — только техадмин (WIKI_TECH_ADMIN), см. useWikiAccess
    canDelete?: boolean;
    onClose: () => void;
    onInsert: (markdown: string) => void;
}

function WikiFilesModal({ open, api, wiki, articleId, canDelete, onClose, onInsert }: WikiFilesModalProps) {
    const [files, setFiles] = useState<FileDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setFiles(await api.getArticleFiles(articleId));
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || "Не удалось загрузить файлы");
        }
        setLoading(false);
    }, [api, articleId]);

    useEffect(() => {
        if (open) load();
    }, [open, load]);

    const insertImage = (file: FileDto) => {
        onInsert(`![@](file(${file.id}))`);
        onClose();
    };

    const insertLink = (file: FileDto) => {
        onInsert(`[@](file(${file.id}))`);
        onClose();
    };

    const remove = async (file: FileDto) => {
        setBusy(true);
        setError(null);
        try {
            await api.deleteWikiFile(wiki, file.id);
            await load();
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || "Не удалось удалить файл");
        }
        setBusy(false);
    };

    const isImage = (file: FileDto) =>
        file.kind === "IMAGE" || (file.contentType || "").startsWith("image/");

    return (
        <Modal open={open} onClose={onClose} size="small" closeIcon>
            <Modal.Header>Файлы статьи</Modal.Header>
            <Modal.Content scrolling>
                {error && <Message error content={error} />}

                {loading ? (
                    <Loader active inline="centered" />
                ) : files.length === 0 ? (
                    <Message info content="К статье ещё не прикреплены файлы. Загрузите их кнопкой «Изображение» или перетащив в редактор." />
                ) : (
                    <List divided relaxed verticalAlign="middle">
                        {files.map((file) => (
                            <List.Item key={file.id}>
                                <List.Content floated="right">
                                    {isImage(file) && (
                                        <Button
                                            size="tiny"
                                            basic
                                            icon="image"
                                            title="Вставить картинкой"
                                            onClick={() => insertImage(file)}
                                        />
                                    )}
                                    <Button
                                        size="tiny"
                                        basic
                                        icon="linkify"
                                        title="Вставить ссылкой"
                                        onClick={() => insertLink(file)}
                                    />
                                    {canDelete && (
                                        <Button
                                            size="tiny"
                                            basic
                                            color="red"
                                            icon="trash"
                                            title="Удалить файл"
                                            disabled={busy}
                                            onClick={() => remove(file)}
                                        />
                                    )}
                                </List.Content>

                                {isImage(file) ? (
                                    <WikiFileImage
                                        id={file.id}
                                        alt={file.name}
                                        style={{
                                            width: 40,
                                            height: 40,
                                            objectFit: "cover",
                                            float: "left",
                                            marginRight: "0.8em",
                                            borderRadius: 4,
                                        }}
                                    />
                                ) : (
                                    <Icon name="file outline" size="large" style={{ float: "left", marginRight: "0.8em" }} />
                                )}

                                <List.Content>
                                    <List.Header
                                        style={{
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {file.name}
                                    </List.Header>
                                    <List.Description>
                                        {formatFileSize(file.size)}
                                        {file.width && file.height ? ` · ${file.width}×${file.height}` : ""}
                                    </List.Description>
                                </List.Content>
                            </List.Item>
                        ))}
                    </List>
                )}
            </Modal.Content>
        </Modal>
    );
}

export default WikiFilesModal;
