import Axios from "axios";
import { toast } from "@kokomi/react-semantic-toasts";
import React, { useContext, useMemo, useRef, useState } from "react";
import {
    Button,
    Form,
    Header,
    List,
    Message,
    Progress,
    Segment,
} from "semantic-ui-react";
import { AuthContext, RestContext } from "../../context";
import {
    BatchUploadDryRunOut,
    BatchUploadResultOut,
    UploadVersionDryRunOut,
    UploadVersionResultOut,
} from "../../models/rest/Updater";

import "./AdminAutoupdaterPage.scss";

type UploadMode = "simple" | "bundle";
type PendingAction = "upload" | "dry-run" | null;
type UploadResult =
    | { type: "simple-upload"; data: UploadVersionResultOut }
    | { type: "simple-dry-run"; data: UploadVersionDryRunOut }
    | { type: "bundle-upload"; data: BatchUploadResultOut }
    | { type: "bundle-dry-run"; data: BatchUploadDryRunOut };

function AdminAutoupdaterPage() {
    const { updaterApi } = useContext(RestContext);
    const apiToken = useContext(AuthContext).auth.apiToken;

    const fileInput = useRef<HTMLInputElement>(null);

    const [mode, setMode] = useState<UploadMode>("simple");
    const [channel, setChannel] = useState("stable");
    const [product, setProduct] = useState("");
    const [version, setVersion] = useState("");
    const [archive, setArchive] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [pendingAction, setPendingAction] = useState<PendingAction>(null);
    const [result, setResult] = useState<UploadResult | null>(null);

    const hasPublishAuthority = apiToken.hasAuthority("UPDATES_PUBLISH");
    const hasRequiredFields = useMemo(() => {
        if (!channel.trim() || !archive) return false;

        if (mode === "bundle") return true;

        return !!product.trim() && !!version.trim();
    }, [archive, channel, mode, product, version]);

    const getModeDescription = () => {
        if (mode === "bundle") {
            return "Бандл режим использует один архив со scoped _manifest.json и загружает несколько продуктов за раз.";
        }

        return "Простой режим загружает одну версию для конкретного продукта и канала.";
    };

    const getErrorMessage = (uploadError: unknown) => {
        if (Axios.isAxiosError(uploadError)) {
            const serverData = uploadError.response?.data;

            if (typeof serverData === "string" && serverData.trim().length > 0) {
                return serverData;
            }

            if (serverData && typeof serverData === "object" && "error" in serverData) {
                const errorMessage = serverData.error;

                if (typeof errorMessage === "string" && errorMessage.trim().length > 0) {
                    return errorMessage;
                }
            }

            return uploadError.message;
        }

        if (uploadError instanceof Error) return uploadError.message;

        return String(uploadError);
    };

    const runAction = async (action: Exclude<PendingAction, null>) => {
        if (!hasRequiredFields || !archive || !hasPublishAuthority) return;

        setPendingAction(action);
        setError(null);
        setResult(null);
        setProgress(0);

        const requestOptions = {
            onUploadProgress: (progressEvent: ProgressEvent) => {
                const total = progressEvent.total || archive.size || 0;

                if (total > 0) {
                    setProgress(Math.min(100, Math.round((progressEvent.loaded / total) * 100)));
                }
            },
        };

        try {
            if (mode === "simple") {
                const payload = {
                    version: version.trim(),
                    channel: channel.trim(),
                    product: product.trim(),
                    archive,
                };

                if (action === "dry-run") {
                    const data = await updaterApi.uploadVersionDryRun(payload, requestOptions);
                    setResult({ type: "simple-dry-run", data });
                    toast({ title: "Dry run завершен", type: "info" });
                } else {
                    const data = await updaterApi.uploadVersion(payload, requestOptions);
                    setResult({ type: "simple-upload", data });
                    toast({ title: "Версия загружена", type: "success" });
                }
            } else {
                const payload = {
                    channel: channel.trim(),
                    archive,
                };

                if (action === "dry-run") {
                    const data = await updaterApi.uploadBatchDryRun(payload, requestOptions);
                    setResult({ type: "bundle-dry-run", data });
                    toast({ title: "Dry run завершен", type: "info" });
                } else {
                    const data = await updaterApi.uploadBatch(payload, requestOptions);
                    setResult({ type: "bundle-upload", data });
                    toast({ title: "Бандл загружен", type: "success" });
                }
            }
        } catch (uploadError) {
            const message = getErrorMessage(uploadError);

            setError(message);
            toast({
                title: action === "dry-run" ? "Ошибка dry run" : "Ошибка загрузки версии",
                description: message,
                type: "error",
                time: 10000,
            });
        } finally {
            setPendingAction(null);
        }
    };

    const renderSimpleUploadResult = (data: UploadVersionResultOut) => {
        return (
            <Message success>
                <Message.Header>Версия успешно загружена</Message.Header>
                <List>
                    <List.Item>Канал: {data.channel}</List.Item>
                    <List.Item>Продукт: {data.product}</List.Item>
                    <List.Item>Версия: {data.version}</List.Item>
                    <List.Item>Файлов сохранено: {data.filesStored}</List.Item>
                    <List.Item>Новых файлов: {data.newFilesStored}</List.Item>
                </List>
            </Message>
        );
    };

    const renderSimpleDryRunResult = (data: UploadVersionDryRunOut) => {
        return (
            <Message info>
                <Message.Header>Dry run завершен</Message.Header>
                <List>
                    <List.Item>Канал: {data.channel}</List.Item>
                    <List.Item>Продукт: {data.product}</List.Item>
                    <List.Item>Версия: {data.version}</List.Item>
                    <List.Item>Файлов к сохранению: {data.filesToStore}</List.Item>
                </List>
                {data.files.length > 0 && (
                    <List divided relaxed className="admin-autoupdater__result-list">
                        {data.files.map((filePath) => {
                            return <List.Item key={filePath}>{filePath}</List.Item>;
                        })}
                    </List>
                )}
            </Message>
        );
    };

    const renderBundleUploadResult = (data: BatchUploadResultOut) => {
        return (
            <Message success>
                <Message.Header>Бандл обработан</Message.Header>
                <List>
                    <List.Item>Канал: {data.channel}</List.Item>
                    <List.Item>Импортировано версий: {data.importedVersions}</List.Item>
                    <List.Item>Пропущено версий: {data.skippedVersions}</List.Item>
                </List>
                <List divided relaxed className="admin-autoupdater__result-list">
                    {data.versions.map((versionResult) => {
                        return (
                            <List.Item key={`${versionResult.product}-${versionResult.version}`}>
                                <List.Content>
                                    <List.Header>
                                        {versionResult.product} {versionResult.version}
                                    </List.Header>
                                    <List.Description>
                                        {versionResult.imported ? "Импортировано" : "Пропущено"}; файлов сохранено{" "}
                                        {versionResult.filesStored}, новых файлов {versionResult.newFilesStored}
                                        {versionResult.error ? `. Ошибка: ${versionResult.error}` : ""}
                                    </List.Description>
                                </List.Content>
                            </List.Item>
                        );
                    })}
                </List>
            </Message>
        );
    };

    const renderBundleDryRunResult = (data: BatchUploadDryRunOut) => {
        return (
            <Message info>
                <Message.Header>Dry run бандла завершен</Message.Header>
                <List>
                    <List.Item>Канал: {data.channel}</List.Item>
                    <List.Item>Обрабатываемых версий: {data.processableVersions}</List.Item>
                    <List.Item>Версий с ошибками: {data.failedVersions}</List.Item>
                </List>
                <List divided relaxed className="admin-autoupdater__result-list">
                    {data.versions.map((versionResult) => {
                        return (
                            <List.Item key={`${versionResult.product}-${versionResult.version}`}>
                                <List.Content>
                                    <List.Header>
                                        {versionResult.product} {versionResult.version}
                                    </List.Header>
                                    <List.Description>
                                        {versionResult.processable ? "Готово к загрузке" : "Необрабатываемо"}; файлов к
                                        сохранению {versionResult.filesToStore}
                                        {versionResult.error ? `. Ошибка: ${versionResult.error}` : ""}
                                    </List.Description>
                                    {versionResult.files.length > 0 && (
                                        <List bulleted className="admin-autoupdater__result-files">
                                            {versionResult.files.map((filePath) => {
                                                return <List.Item key={filePath}>{filePath}</List.Item>;
                                            })}
                                        </List>
                                    )}
                                </List.Content>
                            </List.Item>
                        );
                    })}
                </List>
            </Message>
        );
    };

    const renderResult = () => {
        if (!result) return null;

        switch (result.type) {
            case "simple-upload":
                return renderSimpleUploadResult(result.data);
            case "simple-dry-run":
                return renderSimpleDryRunResult(result.data);
            case "bundle-upload":
                return renderBundleUploadResult(result.data);
            case "bundle-dry-run":
                return renderBundleDryRunResult(result.data);
        }
    };

    return (
        <div className="admin-autoupdater">
            <Header as="h1">Автоапдейтер</Header>
            <p>Загрузка новых версий через Updater API с поддержкой простого и бандл режимов.</p>

            <Segment>
                <div className="admin-autoupdater__mode-switch">
                    <Button.Group>
                        <Button
                            basic={mode !== "simple"}
                            primary={mode === "simple"}
                            onClick={() => {
                                setMode("simple");
                                setError(null);
                                setResult(null);
                            }}
                        >
                            Простой режим
                        </Button>
                        <Button
                            basic={mode !== "bundle"}
                            primary={mode === "bundle"}
                            onClick={() => {
                                setMode("bundle");
                                setError(null);
                                setResult(null);
                            }}
                        >
                            Бандл режим
                        </Button>
                    </Button.Group>
                </div>

                <Message info>{getModeDescription()}</Message>

                {!hasPublishAuthority && (
                    <Message warning>
                        Для загрузки и dry run требуется authority <b>UPDATES_PUBLISH</b>.
                    </Message>
                )}

                <Form>
                    <Form.Group widths="equal">
                        <Form.Input
                            label="Канал"
                            placeholder="stable"
                            value={channel}
                            onChange={(_, data) => {
                                setChannel((data.value as string) || "");
                            }}
                        />

                        {mode === "simple" && (
                            <Form.Input
                                label="Продукт"
                                placeholder="launcher"
                                value={product}
                                onChange={(_, data) => {
                                    setProduct((data.value as string) || "");
                                }}
                            />
                        )}

                        {mode === "simple" && (
                            <Form.Input
                                label="Версия"
                                placeholder="1.0.0.1"
                                value={version}
                                onChange={(_, data) => {
                                    setVersion((data.value as string) || "");
                                }}
                            />
                        )}
                    </Form.Group>

                    <Form.Field>
                        <label>Архив</label>
                        <input
                            accept=".zip,.7z"
                            hidden
                            onChange={(event) => {
                                const selectedFile = event.target.files?.[0] || null;

                                setArchive(selectedFile);
                                setError(null);
                                setResult(null);
                                event.target.value = "";
                            }}
                            ref={fileInput}
                            type="file"
                        />
                        <div className="admin-autoupdater__archive-row">
                            <Button
                                icon="folder open"
                                content="Выбрать архив"
                                type="button"
                                onClick={() => {
                                    fileInput.current?.click();
                                }}
                            />
                            <span className="admin-autoupdater__archive-name">
                                {archive ? archive.name : "Архив не выбран"}
                            </span>
                        </div>
                    </Form.Field>

                    <div className="admin-autoupdater__actions">
                        <Button
                            basic
                            content="Dry Run"
                            disabled={!hasRequiredFields || !hasPublishAuthority || pendingAction !== null}
                            loading={pendingAction === "dry-run"}
                            onClick={() => {
                                void runAction("dry-run");
                            }}
                            type="button"
                        />
                        <Button
                            content="Загрузить версию"
                            disabled={!hasRequiredFields || !hasPublishAuthority || pendingAction !== null}
                            loading={pendingAction === "upload"}
                            onClick={() => {
                                void runAction("upload");
                            }}
                            primary
                            type="button"
                        />
                    </div>
                </Form>
            </Segment>

            {pendingAction && (
                <Segment>
                    <Progress
                        indicating
                        label={pendingAction === "dry-run" ? "Подготовка dry run" : "Загрузка архива"}
                        percent={progress}
                        progress="percent"
                    />
                </Segment>
            )}

            {error && (
                <Message error>
                    <Message.Header>Ошибка выполнения запроса</Message.Header>
                    <p>{error}</p>
                </Message>
            )}

            {renderResult()}
        </div>
    );
}

export default AdminAutoupdaterPage;
