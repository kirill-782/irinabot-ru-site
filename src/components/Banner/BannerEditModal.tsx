import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Button, Checkbox, Form, Image, Message, Modal } from "semantic-ui-react";
import { RestContext } from "../../context";
import {
    BANNER_PLACEMENTS,
    BANNER_PLACEMENT_TITLES,
    BannerAdminDto,
    BannerPlacement,
    BannerRequest,
} from "../../models/rest/Banner";
import { runWithToast } from "../../utils/ToastUtils";
import {
    fromDateTimeLocalInputValue,
    toDateTimeLocalInputValue,
} from "../../utils/AdminListUtils";

interface BannerEditModalProps {
    open: boolean;
    // null — создание нового баннера
    banner: BannerAdminDto | null;
    onClose: () => void;
    onSaved: (banner: BannerAdminDto) => void;
}

// Числовые поля держим строками — пустая строка значит «не задано» (в запрос не идёт).
interface BannerFormState {
    placement: BannerPlacement;
    title: string;
    targetUrl: string;
    creatorId: string;
    index: string;
    weight: string;
    priority: boolean;
    enabled: boolean;
    startsAt: string;
    expiresAt: string;
}

const emptyForm = (): BannerFormState => ({
    placement: "GAME_LIST",
    title: "",
    targetUrl: "",
    creatorId: "",
    index: "",
    weight: "",
    priority: false,
    enabled: true,
    startsAt: "",
    expiresAt: "",
});

const toForm = (banner: BannerAdminDto): BannerFormState => ({
    placement: banner.placement,
    title: banner.title ?? "",
    targetUrl: banner.targetUrl ?? "",
    creatorId: banner.creatorId !== undefined && banner.creatorId !== null ? String(banner.creatorId) : "",
    index: banner.index !== undefined && banner.index !== null ? String(banner.index) : "",
    weight: banner.weight !== undefined && banner.weight !== null ? String(banner.weight) : "",
    priority: !!banner.priority,
    enabled: banner.enabled !== false,
    startsAt: toDateTimeLocalInputValue(banner.startsAt),
    expiresAt: toDateTimeLocalInputValue(banner.expiresAt),
});

const toIsoOrUndefined = (value: string) => {
    const time = fromDateTimeLocalInputValue(value);

    return time === null ? undefined : new Date(time).toISOString();
};

const toNumberOrUndefined = (value: string) => {
    const trimmed = value.trim();

    return trimmed === "" ? undefined : Number(trimmed);
};

const placementOptions = BANNER_PLACEMENTS.map((placement) => ({
    key: placement,
    value: placement,
    text: BANNER_PLACEMENT_TITLES[placement],
}));

function BannerEditModal({ open, banner, onClose, onSaved }: BannerEditModalProps) {
    const { wikiApi } = useContext(RestContext);

    const [form, setForm] = useState<BannerFormState>(emptyForm);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const fileInput = useRef<HTMLInputElement>(null);

    // Сброс формы при каждом открытии — модалка переиспользуется для всех баннеров.
    useEffect(() => {
        if (!open) return;

        setForm(banner ? toForm(banner) : emptyForm());
        setFile(null);
        setError(null);
    }, [open, banner]);

    // Превью выбранного файла живёт до его смены — objectURL нужно освобождать.
    const filePreview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

    useEffect(() => {
        if (!filePreview) return;

        return () => URL.revokeObjectURL(filePreview);
    }, [filePreview]);

    // Картинка отдаётся с ETag — после замены добавляем метку версии, иначе браузер
    // покажет старую из кеша.
    const savedImage =
        banner?.hasImage && open
            ? `${wikiApi.getBannerImageUrl(banner.id)}?v=${encodeURIComponent(banner.updatedAt ?? "")}`
            : null;

    const preview = filePreview ?? savedImage;

    const setField = <K extends keyof BannerFormState>(key: K, value: BannerFormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const validate = (): string | null => {
        if (!form.targetUrl.trim()) return "Укажите ссылку перехода";

        const index = toNumberOrUndefined(form.index);
        if (index !== undefined && (!Number.isInteger(index) || index < 0)) {
            return "Позиция должна быть целым числом не меньше 0";
        }

        const weight = toNumberOrUndefined(form.weight);
        if (weight !== undefined && (!Number.isInteger(weight) || weight < 1)) {
            return "Вес должен быть целым числом не меньше 1";
        }

        const creatorId = toNumberOrUndefined(form.creatorId);
        if (creatorId !== undefined && !Number.isInteger(creatorId)) {
            return "ID создателя должен быть целым числом";
        }

        const startsAt = fromDateTimeLocalInputValue(form.startsAt);
        const expiresAt = fromDateTimeLocalInputValue(form.expiresAt);
        if (startsAt !== null && expiresAt !== null && expiresAt <= startsAt) {
            return "Дата окончания должна быть позже даты начала";
        }

        if (!banner && !file) return "Загрузите картинку баннера";

        return null;
    };

    const save = async () => {
        const validationError = validate();

        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null);

        const request: BannerRequest = {
            placement: form.placement,
            title: form.title.trim() || undefined,
            targetUrl: form.targetUrl.trim(),
            creatorId: toNumberOrUndefined(form.creatorId),
            index: toNumberOrUndefined(form.index),
            weight: toNumberOrUndefined(form.weight),
            priority: form.priority,
            enabled: form.enabled,
            startsAt: toIsoOrUndefined(form.startsAt),
            expiresAt: toIsoOrUndefined(form.expiresAt),
        };

        setSaving(true);

        // PUT заменяет баннер целиком, поэтому и при создании, и при правке шлём
        // одинаковое тело; картинка грузится отдельным запросом после сохранения.
        const result = await runWithToast(
            async () => {
                const saved = banner
                    ? await wikiApi.replaceBanner(banner.id, request)
                    : await wikiApi.createBanner(request);

                if (!file) return saved;

                return await wikiApi.uploadBannerImage(saved.id, file);
            },
            {
                success: banner ? "Баннер сохранён" : "Баннер создан",
                error: "Не удалось сохранить баннер",
            }
        );

        setSaving(false);

        if (!result.ok) return;

        onSaved(result.value);
        onClose();
    };

    return (
        <Modal open={open} onClose={onClose} closeIcon size="small">
            <Modal.Header>{banner ? "Редактирование баннера" : "Новый баннер"}</Modal.Header>
            <Modal.Content scrolling>
                <Form>
                    <Form.Group widths="equal">
                        <Form.Select
                            label="Место показа"
                            options={placementOptions}
                            value={form.placement}
                            onChange={(_, data) => setField("placement", data.value as BannerPlacement)}
                        />
                        <Form.Input
                            label="Название"
                            placeholder="Только для админки и alt картинки"
                            maxLength={255}
                            value={form.title}
                            onChange={(_, data) => setField("title", data.value)}
                        />
                    </Form.Group>

                    <Form.Input
                        label="Ссылка перехода"
                        placeholder="https://…"
                        maxLength={2000}
                        required
                        value={form.targetUrl}
                        onChange={(_, data) => setField("targetUrl", data.value)}
                    />

                    <Form.Group widths="equal">
                        <Form.Input
                            label="Позиция в списке"
                            placeholder="номер строки, напр. 10"
                            type="number"
                            min={0}
                            value={form.index}
                            onChange={(_, data) => setField("index", data.value)}
                        />
                        <Form.Input
                            label="ID создателя игры"
                            placeholder="показывать у игр этого хоста"
                            type="number"
                            value={form.creatorId}
                            onChange={(_, data) => setField("creatorId", data.value)}
                        />
                        <Form.Input
                            label="Вес ротации"
                            placeholder="1 и больше"
                            type="number"
                            min={1}
                            value={form.weight}
                            onChange={(_, data) => setField("weight", data.value)}
                        />
                    </Form.Group>

                    <Form.Group widths="equal">
                        <Form.Input
                            label="Показ с"
                            type="datetime-local"
                            value={form.startsAt}
                            onChange={(_, data) => setField("startsAt", data.value)}
                        />
                        <Form.Input
                            label="Показ до"
                            type="datetime-local"
                            value={form.expiresAt}
                            onChange={(_, data) => setField("expiresAt", data.value)}
                        />
                    </Form.Group>

                    <Form.Field>
                        <Checkbox
                            toggle
                            label="Включён"
                            checked={form.enabled}
                            onChange={(_, data) => setField("enabled", !!data.checked)}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Checkbox
                            toggle
                            label="Приоритетный (виден и владельцам VIP)"
                            checked={form.priority}
                            onChange={(_, data) => setField("priority", !!data.checked)}
                        />
                    </Form.Field>

                    <Form.Field>
                        <label>Картинка</label>
                        <input
                            accept="image/*"
                            hidden
                            onChange={(event) => {
                                setFile(event.target.files?.[0] || null);
                                setError(null);
                                event.target.value = "";
                            }}
                            ref={fileInput}
                            type="file"
                        />
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75em" }}>
                            <Button
                                type="button"
                                icon="image"
                                content={banner?.hasImage || file ? "Заменить картинку" : "Выбрать картинку"}
                                onClick={() => fileInput.current?.click()}
                            />
                            {file && <span>{file.name}</span>}
                            {!file && !banner?.hasImage && <span>картинка не загружена</span>}
                        </div>
                        {preview && (
                            <Image
                                src={preview}
                                alt={form.title}
                                style={{ marginTop: "0.75em", maxHeight: 120 }}
                            />
                        )}
                    </Form.Field>
                </Form>

                {error && <Message error content={error} />}
            </Modal.Content>
            <Modal.Actions>
                <Button content="Отмена" onClick={onClose} disabled={saving} />
                <Button primary icon="save" content="Сохранить" onClick={save} loading={saving} disabled={saving} />
            </Modal.Actions>
        </Modal>
    );
}

export default BannerEditModal;
