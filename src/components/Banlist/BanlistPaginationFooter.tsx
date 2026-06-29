import React, { useContext } from "react";
import { Dropdown, Header, Pagination } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";
import { PAGE_SIZE_OPTIONS } from "../../hooks/useBanlistEntriesFilter";

import "./BanlistPaginationFooter.scss";

const PAGE_SIZE_DROPDOWN_OPTIONS = PAGE_SIZE_OPTIONS.map((n) => ({
    key: n,
    value: n,
    text: String(n),
}));

interface BanlistPaginationFooterProps {
    // 0-базовый номер страницы
    page: number;
    pageSize: number;
    total: number;
    // сколько элементов реально показано на странице
    shownCount: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
}

// Подвал списков банлиста: «показано X из Y» + размер страницы + пагинация.
function BanlistPaginationFooter(props: BanlistPaginationFooterProps) {
    const { page, pageSize, total, shownCount, onPageChange, onPageSizeChange } = props;

    const { language } = useContext(AppRuntimeSettingsContext);
    const t = language.getString;

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="banlist-pagination-footer">
            <div className="footer-left">
                <Header as="h5" className="count" sub>
                    {t("banlistEntriesShown", { count: shownCount, total })}
                </Header>
                <div className="page-size">
                    <span>{t("banlistEntriesPerPage")}</span>
                    <Dropdown
                        compact
                        onChange={(_, data) => onPageSizeChange(Number(data.value))}
                        options={PAGE_SIZE_DROPDOWN_OPTIONS}
                        selection
                        value={pageSize}
                    />
                </div>
            </div>
            {totalPages > 1 && (
                <Pagination
                    activePage={page + 1}
                    boundaryRange={1}
                    firstItem={null}
                    lastItem={null}
                    onPageChange={(_, data) => onPageChange(Number(data.activePage) - 1)}
                    siblingRange={1}
                    size="mini"
                    totalPages={totalPages}
                />
            )}
        </div>
    );
}

export default BanlistPaginationFooter;
