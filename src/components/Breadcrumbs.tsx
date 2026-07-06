import React from "react";
import { Link } from "react-router-dom";
import { Breadcrumb } from "semantic-ui-react";

import "./Breadcrumbs.scss";

export interface BreadcrumbItem {
    label: React.ReactNode;
    // если задан — секция кликабельная ссылка; без него — текущая (активная) страница
    to?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

// Хлебные крошки страницы (навигация вида «Раздел / Подраздел / Текущее»). Секции с `to`
// рендерятся ссылками, без `to` — активной страницей. Пустые (null/undefined label) пропускаются.
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
    const visible = items.filter((item) => item.label !== null && item.label !== undefined);

    if (visible.length === 0) return null;

    return (
        <Breadcrumb className={className ? `crumbs ${className}` : "crumbs"}>
            {visible.map((item, index) => (
                <React.Fragment key={index}>
                    {index > 0 && <Breadcrumb.Divider />}
                    {item.to ? (
                        <Breadcrumb.Section as={Link} to={item.to}>
                            {item.label}
                        </Breadcrumb.Section>
                    ) : (
                        <Breadcrumb.Section active>{item.label}</Breadcrumb.Section>
                    )}
                </React.Fragment>
            ))}
        </Breadcrumb>
    );
};

export default Breadcrumbs;
