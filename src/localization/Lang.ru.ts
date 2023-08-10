export type LanguageRepository = typeof LanguageData;
export type LanguageRepositoryKeys = keyof LanguageRepository;

const LanguageData = {
    error: "Ошибка",
    send: "Отправить",
    save: "Сохранить",
    you: "Вы",
    loading: "Загрузка",
    loadingDotted: "Загрузка . . .",
    loadMore: "Загрузить еще",
    select: "Выбрать",
    edit: "Редактировать",
    remove: "Удалить",
    cancel: "Отмена",
    copy: "Копировать",
    preview: "Предпросмотр",
    actions: "Действия",
    yes: "Да",
    no: "Нет",
    close: "Закрыть",
    or: "Или",
    unknown: "Неизвестно",
    create: "Создать",

    keyMissing: "{key}",

    hookWebsocketAuthLoginError: "Ошибка входа",
    hookWebsocketAuthSessionExpiredError: "Сессия просрочена. Войдите заново",

    hookConnectorGameAddNotificationTitle: "Игра в коннектор отправлена",
    hookConnectorGameAddNotificationDescription: "Зайдите в LAN Warcraft III, чтобы войти",

    siteSpareLoader: "Фиксики размещают теги по местам, ожидайте",
    siteErrorCatch:
        "На сайте произошла ошибка. Проверьте интернет соединение, обвините страницу или обратитесь к администратору",
    footerHostbotWebsocketHint: "Отображает состояние соединения с хостботом.",

    chatListConsoleBotTitle: "Консоль бота",
    chatListConsoleBotDescription: "Консоль бота для ввода команд",
    chatListNicknameLabel: "Введите никнейм",
    chatListStartChat: "Начать чат",
    chatChat: "Чат",
    chatConsole: "Консоль",
    chatRowRemoveConfirm: "Подтвердить удаление",
    chatRowNoMessages: "Нет сообщений",

    configSelectTabRemoveError: "Ошибка удаления",
    configSelectTabUpdateDate: "Дата обновления: {date}",
    configSelectTabGoToMap: "Перейти к карте",
    configSelectTabNoConfigMessage: "Вы не создали еще ни одного конфига. Создать конфиг можно на странице карты.",

    configPreview: "Вы - конгфиг **{name}** для версии **{version}**",

    mapSelectTabFilters: "Фильтры",
    mapSelectTabSearchMap: "Поиск карты",
    mapSelectTabSearchPlaceholder: "Введите часть названия карты...",

    gameOptionsDefault: "По умочланию",
    gameOptionsHidden: "Скрыта",
    gameOptionsExplored: "Разведана",

    gameOptionsOpen: "Открыта",
    gameOptionsSlow: "Медленно",
    gameOptionsMedium: "Средне",
    gameOptionsFast: "Быстро",

    gameOptionsNo: "Нет",
    gameOptionsAllObservers: "Все зрители",
    gameOptionsAfterDefeat: "После поражения",
    gameOptionsJudges: "Судьи",

    gameOptionsPassword: "Вход по паролю (будет выдан после создания игры)",
    gameOptionsConfigNameLabel: "Имя конфига",
    gameOptionsTeamsTogether: "Города союзников рядом",
    gameOptionsLockTeams: "Фиксация кланов",
    gameOptionsFullSharedUnitControl: "Общие войска",
    gameOptionsRandomRaces: "Случайные расы",
    gameOptionsRandomHeros: "Случайные герои",
    gameOptionsObserversLabel: "Зрители",
    gameOptionsMapVisibilityLabel: "Карта",
    gameOptionsSpeedLabel: "Скорость",

    createGameConfirmPatchNotificationsAccessDenied:
        "У вас отсуствуют права парсить конфиги. Выберите другую версию с готовым конфигом.",
    createGameConfirmPatchNotificationsConfigCreating: "Конфиг создается. Вернитесь на страницу создания игры позже.",
    createGameConfirmPatchNotificationsIncompletableMap: "Карта не совместима с выбранной версией",

    gameListFilterSortDefault: "По умолчанию",
    gameListFilterSortFreeSlots: "Свободно слотов",
    gameListFilterSortAllSlots: "Всего слотов",
    gameListFilterSortPlayers: "Игроков в игре",

    gameListFilterNoLoadStartGames: "Не загружать начатые игры",
    gameListFilterForceReorder: "Принудительно пересортировывать список",
    gameListFilterOnlySelfGames: "Только мои игры",
    gameListFilterOnlyFavoriteMaps: "Только избранные карты",
    gameListFilterGameTypeLabel: "Игры по типу",

    gameListFilterHiddenPatchLabel: "Скрыть игры патчей",
    gameListFilterHiddenPatchPlaceholder: "Патчи",

    gameListFilterPlainGamesOnly: "Только обычные игры",
    gameListFilterAllGames: "Все игры",
    gameListFilterNonPlainOnly: "Игры с переопределением позиции",
    gameListFilterPlayerFilterLabel: "Фильтр по игрокам в лобби",
    gameListFilterFreeSlotsFilterLabel: "Фильтр по свободным слотам",
    gameListFilterAllSlotsFilterLabel: "Фильтр по числу слотов",

    connectorAddButtonEnterClosedGame: "Вход в закрытую игру",
    connectorAddButtonPassword: "Пароль",
    connectorAddButtonEnter: "Войти",

    sendSignalButtonSend: "Отправить сигнал",
    sendSignalButtonSignalLabel: "Какой сигнал отправить в игру",
    sendSignalButtonSignalPlaceholder: "Сигнал",

    onlineStatsCategory: "Категория",
    onlineStatsGames: "Игр",
    onlineStatsPlayers: "Игроков",

    onlineStatsCategoryTypeAll: "Всего",
    onlineStatsCategoryTypeLobby: "Лобби",
    onlineStatsCategoryTypeStarted: "Начатые игры",
    onlineStatsCategoryTypeOther: "Игроки с остальных платфром",
    onlineStatsCategoryTypeRealm: "Игроков с {realm}",
    onlineStatsCategoryTypePatch: "Патч {patch}",

    mapInfoPlayersCount: "Кол-во игроков: ",

    gameListTableHeaderVersion: "Версия",
    gameListTableHeaderSlots: "Слоты",
    gameListTableHeaderGameName: "Игра",
    gameListTableHeaderPlayers: "Игроки",
    gameListTableHeaderOwner: "Владелец",

    gameListPlayerItemPlayerOtherPlatform: "Игрок другой платформы",
    gameListPlayerItemSendMessage: "Написать сообщение",

    onlineStatsCounter: "Всего: {count}",

    userDropdownCreateGame: "Создать игру",
    userDropdownSettings: "Настройки",
    userDropdownAccessList: "Список прав",
    userDropdownLogout: "Выйти (в окно)",

    uploadMapUploadingError: "Ошибка загрузки карты",
    uploadMapMapUploadedNotificationTitle: "Карта загружена",
    uploadMapMapUploadedNotificationDescription:
        "Карта {name} загружена. Кликните по уведомлению, чтобы перейти к карте.",
    uploadMapNoUploadingHint: "Карты не загружаются",
    uploadMapUploadingStatsHint: "Загрузка: {fillename} {percent}%",
    uploadMapUploadMap: "Загрузка карт",

    loginDropdownOption: "Войти",
    languageDropdownOption: "Язык",

    utilsDropdownOption: "Утилиты",
    utilsDropdownAutohostList: "Список автохостов",
    utilsDropdownAccessMaskCalc: "Калькулятор accessMask",

    menuActiveGames: "Активные игры",
    menuMapList: "Список карт",
    menuHelp: "Справка",
    menuAutoPay: "Донат",
    menuThemeChange: "Сменить тему",

    mapListPageTitle: "Список карт",
    mapListPageDescription: "Список карт",
    mapListPageFilters: "Фильтры",
    mapListPageMapList: "Список карт",
    mapListSearchMapLabel: "Поиск карты",
    mapListLoadMore: "Поиск карты",
    mapListSearchMapPlaceholder: "Введите часть названия карты...",
    mapListOnlyLobby: "Ограничить поиск картами из списка с играми",

    mapEditPageFlagsNotification:
        "Данные флаги влияют на поведение объекта карты. Обратите внимание, что тег уникален и не может задан для не верефицированных карт.",
    mapEditPageFlagsLoading: "Флаги загружаются",
    mapEditPageExtraDescriptionLabel: "Дополнительное описание",
    mapEditPageExtraDescriptionNotification:
        "Вы в тексте можете использовать разметку Markdown. Старайтесь указывать уникальную информацию о карте.",

    flagsEditBlockCanDownload: "Карту можно скачать",
    flagsEditBlockMapLocked: "Карта заблокирована",
    flagsEditBlockImagesAvailable: "Изображения из карты доступны",
    flagsEditBlockMapVerified: "Карта проверена",
    flagsEditBlockCategories: "Категории",
    flagsEditBlockCategoriesPlaceholder: "Категории",
    flagsEditBlockMapTagLabel: "Тег карты (отметка)",

    mapCardShowAllText: "Показать весь текст",

    mapFiltersDefault: "(по умолчанию)",
    mapFiltersMapNameSort: "Имя карты",
    mapFiltersUploadDateSort: "Дата загрузки",
    mapFiltersUpdateDateSort: "Дата обновления",
    mapFiltersMapPlayersSort: "Игроков в карте",
    mapFiltersAscOrder: "По возрастанию",
    mapFiltersDescOrder: "По убыванию",

    mapFiltersAny: "(любая)",
    mapFiltersFreeSlotsLabel: "Фильтр по свободным слотам",
    mapFiltersVerifyOnly: "Только верифицированные карты",
    mapFiltersTaggedOnly: "Только отмеченные карты",
    mapFiltersFavoriteOnly: "Только избранные карты",
    mapFiltersSortByLabel: "Сортировка по",
    mapFiltersOrderByLabel: "Порядок сортировки",
    mapFiltersCategoryLabel: "Тип карты",
    mapFiltersOwnerLabel: "Владелец",
    mapFiltersApplyFiltersHint: "Применить фильтры",
    mapFiltersResetFiltersHint: "Сбросить фильтры",

    slotsOpen: "Открыто",
    slotsClose: "Закрыто",
    slotsComputerEasy: "Компьютер (слабый)",
    slotsComputerMedium: "Компьютер (средний)",
    slotsComputerHard: "Компьютер (сильный)",
    slotsHuman: "Альянс",
    slotsOrc: "Орда",
    slotsNightElf: "Ночные эльфы",
    slotsUndead: "Нежить",
    slotsRandom: "Случайная раса",
    slotsTeamNumber: "Клан {team}",
    slotsSlotIdHeader: "SID",

    slotsTypeHeader: "Тип",
    slotsTeamHeader: "Клан",
    slotsRaceHeader: "Раса",
    slotsColorHeader: "Цвет",
    slotsHandicapHeader: "Фора",
    slotsCanChange: "Можно менять",

    mapStatsInGamePlayers: "Игроков в играх",
    mapStatsInLobbyPlayers: "Игроков в лобби",

    mapHeaderAuthor: "**Автор:** ",
    mapHeaderPlayerRecommendation: "**Рекомендации к игрокам:**",
    mapHeaderSourceFileName: "**Имя загруженного файла:** {value}",
    mapHeaderBotFileName: "**Имя файла на боте:** {value}",

    mapFlagsCheat: "Карта содержит читпак",
    mapFlagsSemantic: "Скрипт карты содержит семантические ошибки",
    mapFlagsStatsType: "Тип статистики: {value}",
    mapFlagsHclSupport: "Карта поддерживает HCL",

    mapDownloadButton: "Скачать {value} {unit}",
    gameJoinButton: "Войти в игру",

    configEditPlayerSlots: "Игровые слоты",
    configEditObserverSlots: "Зрители",

    cloneConfigButtonCompatibilityError: "Конфиг для данной версии не готов или карта с данной версией не совместима",
    cloneConfigButtonCloneError: "Ошибка копирования",
    cloneConfigButtonHint: "Клонировать конфиг",
    cloneConfigButtonModalHeader: "Клонировать конфиг",
    cloneConfigButtonVersionLabel: "Версия",
    cloneConfigButtonDefaultConfig: "Стандартный конфиг {version}",
    cloneConfigButtonNameLabel: "Название конфига",

    mapStatusIconFavoriteHint: "Карта у вас в списке избранного",
    mapStatusIconVerifyHint: "Карта проверена",
    mapStatusIconCheatHint: "В карте найден читпак",
    mapStatusIconSemanticHint:
        "Скрипт карты содержит семантические ошибки. Возможно карта эксплуатирует уязвимости игры",

    prepareUploadMapModalHeader: "Выберите карту",
    prepareUploadMapModalSubHeader: "Какую карту загрузить?",
    prepareUploadMapModalDescription:
        "Укажите путь до w3x карты. Обычно карты находятся в папке maps которая находится там где Warcraft III.",
    prepareUploadMapModalCategoryLabel: "Выберите до 5 категорий для карты",
    prepareUploadMapModalCategoryPlaceholder: "Категории",
    prepareUploadMapModalUploadMap: "Загрузка карты",
    prepareUploadMapModalUploadMapSelectCategory: "Перед загрузкой карты, выберите категорию",
    prepareUploadMapModalClickOrDropdown: "Нажмите сюда для загрузки карты или перетащите файл в область окна",
    dragAndDropField: "Перетащите сюда файл",

    mapReportModal: "DEPRECATED",

    gameListFiltersModalHeader: "Фильтр списка игр",

    createAutohostModalHeader: "Создание автохоста",
    createAutohostModalNotification:
        "Бот будет автоматически создавать игры с настроенным автостартом. Один автохост создает одно лобби.",
    createAutohostModalHeaderGameNameLabel: "Имя игры",
    createAutohostModalHeaderGameNamePlaceholder: "Имя игры",
    createAutohostModalAutostartLabel: "Автостарт при игроках",
    createAutohostModalAutostartHeader: "Автостарт",
    createAutohostModalGameLimitPlaceholder: "Лимит игр",
    createAutohostModalGameLimitLabel: "Лимит игр",
    createAutohostModalHclPlaceholder: "HCL строка",
    createAutohostModalHclLabel: "HCL строка",
    createAutohostModalCreate: "Создать",

    connectorSummaryModal: "DEPRECATED",

    autohostListModalRemoveErrorToastTitle: "Ошибка удаления",
    autohostListModalRemoveErrorToastDescription: "Автохост не удален почуму-то {status}",
    autohostListModalListHeader: "Список автохостов",
    autohostListModalLoading: "Список загружается",
    autohostListModalEmptyNotification: "Список автохостов пуст",
    autohostListModalNameHeader: "Имя",
    autohostListModalAutostartHeader: "Автостарт",
    autohostListModalGameLimitHeader: "Лимит игр",
    autohostListModalCreatedGamesHeader: "Создано игр",
    autohostListModalOwnerHeader: "Владелец",

    accessMaskModalVip: "Доступ к VIP командам",
    accessMaskModalManageConfig: "Управлять конфигом",
    accessMaskModalManageGame: "Управлять игрой",
    accessMaskModalManagePlayers: "Упровлять игроками",
    accessMaskModalManageAutohost: "Управлять автохостом",
    accessMaskModalCreateGame: "Создавать игры",
    accessMaskModalPriorityEnter: "Приоритетный вход",
    accessMaskModalPowerUp: "GAME_POWER_UP",
    accessMaskModalLimitedAdmins: "GAME_LIMITED_ADMINS",
    accessMaskModalScopeSettings: "SCOPE_SETTINGS",
    accessMaskModalBan: "Банить",
    accessMaskModalUnban: "Снимать баны",
    accessMaskModalViewBans: "Просматривать баны",
    accessMaskModalAddAdmin: "Назначать администраторов",
    accessMaskModalRemoveAdmin: "Разжаловать администраторов",
    accessMaskModalViewAdmin: "Просматривать список администраторов",
    accessMaskModalShare: "Разделение прав на связанные аккаунты",
    accessMaskModalGlobal: "Глобальный доступ",
    accessMaskModalRootAdmin: "Первородный (рут)",
    accessMaskModalHeader: "Редактор админ прав",

    accessMaskModal3in1: "Добавить 3 в 1",
    accessMaskModalAddBanList: "Добавить BanList",
    accessMaskModalAddAdminList: "Добавить AdminList",

    accessListModalHeader: "Список прав",
    accessListModalNoPermissions: "У вас нет прав. Прощайте",
    accessListModalExpireNotification:
        "Не пугайся, бро. Отображается дата истечения ближайшего доната. Как только он истечет - дата обновится.",
    accessListModalPlayerId: "ID игрока",
    accessListModalAccessMask: "Маска прав",
    accessListModalExpire: "Истекают",
    accessListModalPermanent: "Бессрочно",

    userSettingsModalPvpGnToastHeader: "Привязка PVPGn аккаунта",
    userSettingsModalPvpGnToastDescription: "Отправьте боту на канал следующую команду: !confirm {key}",
    userSettingsModalHeader: "Настройки",
    userSettingsModalConnectHeader: "Подключение аккаунтов",
    userSettingsModalConnectorNicknameLabel: "Nickname IrInA connector",

    registerAccountModalHeader: "Регистрация аккаунта",
    registerAccountModalDescription:
        "Вы с данного акканта входите впервые. Выполнить регистрацию аккаунта с помощью данного способа входа? В будущем вы не сможете отвязать аккаунт социальной сети от аккаунта бота.",

    progressUploadMapModalHeader: "Загрузка карты",
    progressUploadMapModalDescription: "Файл **{filename}** загружается. Пожалуйста дождитесь окончания загрузки.",
    progressUploadMapModalProgressLabel: "Загружено {percent}%",

    forbiddenPageLoginHint: "У вас нет доступа к этой странице. Попробуйте войти на сайт через:",
    forbiddenPageAuthorizationDescription: "Подолжите, когда завершится подключение к серверу, и пройдет авторизация",
    forbiddenPageAuthorizationHeader: "Авторизация. . .",
    forbiddenPageConnectingHeader: "Подключение . . .",
    forbiddenPageAccessDeniedHeader: "Отказано в доступе",
    forbiddenPageAccessDeniedDescription: "У вас отсуствую необходимые права для доступа к данной странице",
    forbiddenPageGotToHome: "На главную",

    editConfigPageConfigSaved: "Конфиг сохранен",
    editConfigPageSaveError: "Ошибка сохранения",
    editConfigPageNotificationDescription:
        "Большая часть параметров предоставлена только для ознакомления. При редактировании учитывайте особенности версии. Конфиг был создан для версии **{version}**",
    editConfigPageNameLabel: "Имя конфига",
    editConfigPageSaveConfig: "Сохранить конфиг",
    editConfigPageJsonEditor: "Редактор JSON",

    createGamePageMap: "Карта",
    createGamePageConfig: "Конфиг",
    createGamePageTitle: "Создать игру",
    createGamePageDescription: "На этой странице можно создать игру",
    createGamePageCreateGame: "Создание игры",

    createGameConfirmPageTitle: "Создать игру",
    createGameConfirmPageGameNameLabel: "Название игры",
    createGameConfirmPageGameNamePlaceholder: "Название игры",
    createGameConfirmPagePatch: "Патч",
    createGameConfirmPageCreateAutohost: "Создать автохост",
    createGameConfirmPageLoadGame: "Загрузить игру",
    createGameConfirmPageGamePassword: "Пароль для входа в игру",
    createGameConfirmPageGamePasswordDescription: "Скопируйте этот пароль, чтобы попасть в игру.",
    createGameConfirmPageNoParameters: "Параметры не переданы",
    createGameConfirmPageAutohostCreated: "Автохост создан",
    createGameConfirmPageAutohostNotCreated: "Автохост не создан {status}",
    createGameConfirmPageMapConfigLoadingError: "Ошибка получения параметров карты",
    createGameConfirmPageGameCreatedToastTitle: "Игра создана",
    createGameConfirmPageGameCreatedToastDescription: "Используйте коннектор, чтобы войти в игру",
    createGameConfirmPageGameCreateErrorToastTitle: "Ошибка при создании игры",
    createGameConfirmPageLoadGameErrorToastTitle: "Ошибка при разборе сохранения",
    createGameConfirmPageGameCreateErrorToastTitleNetworkError: "Ошибка получения параметров карты",

    autopayPageProductVip: "VIP доступ",
    autopayPageProductBanList: "Ban list",
    autopayPageProductAdminList: "Admin list",
    autopayPageProductAutohost: "Autohost",
    autopayPageTitle: "Донат",

    autopayPageProductNotSelectedNotificationTitle: "Не выбран донат",
    autopayPageNotSelectedNotificationDescription: "Отметьте одну или несколько галочек выше",
    autopayPageIncorrectConnectorIdNotificationTitle: "ID connector неверный",
    autopayPageIncorrectConnectorIdNotificationDescription:
        "Неверно введен ID коннектора. Ведите числа напротив # в настройках на сайте",
    autopayPageDescription: "Здесь можно оплатить привилегии на боте",
    autopayPageHeader: "Калькулятор описания для автоподключения доната",
    autopayPageConnectorIdLabel: "Ваш ID",
    autopayPageDurationLabel: "Продолжительность (месяцы)",
    autopayPageTotalLabel: "Итого",
    autopayPagePayCard: "Оплата картой",
    autopayPagePayYooMoney: "Оплата Yoo Money",
    autopayPageHelpNotification:
        "Если вы подключаете автохост впервые - напишите в группу ВК ([https://vk.com/irina_bot](https://vk.com/irina_bot)), либо напишите администрации на сервере Discord ([https://discord.gg/cTfyEZT](https://vk.com/irina_bot)). Там вам выдадут инструкцию по подключению.",

    oathStubPageText: "Я окошко интроверт. Мне не нравится, что на меня кто то смотрит. Закрой пожалуйста меня.",

    notFoundPageTitle: "Страницы нет",
    notFoundPageGoToHome: "На главную",

    mapPageTitle: "Карты Warcraft III",

    mapPageConfigLoading: "Конфиг загружается",
    mapPageSlotsNotParsed: "Слоты не парсились",

    mapEditPageMapLoading: "Карта загружается",
    mapCatalog: "Каталог карт",

    loadingPage: "Загрузка страницы",

    gameListPageTitle: "Список игр",
    gameListPageDescription: "Просмотреть список созданных игр, к которым можно присоедениться.",
    gameListPageQuickFilterPlaceholder: "Быстрый фильтр",
    gameListPageHowToPlay: "Как играть",

    openReplayOpenLinkHeader: "Вставьте ссылку на файл повтора",
    openReplayOpenLink: "Открыть",
    openReplayOpenFile: "Открыть файл",

    replayParserPageBlockHeader: "Блок {seqenceNumber}",

    externalBlockCard: "{timems} после старта игры",
    externalBlockCardEmptyBlock: "(пустой блок)",
    externalBlockCardPlayerSummaryLabel: "{count} комманд от {name}",
    externalBlockCardUnknownActionsLabel: "Неизвестные действия",

    actionLog_1: "Прогручивать страницу к началу блоков",
    actionLog_2: "Не пустые блоки",
    actionLog_3: "Только SyncStoredInteger",
    actionLog_4: "Срабатывания TriggerRegisterPlayerChatEvent",
    actionLog_5: "Загрузить блоки сверху",
    actionLog_6: "Загрузить блоки снизу",

    replayMainInfo_1: "Основное:",
    replayMainInfo_2: "**Имя игры:** {value}",
    replayMainInfo_3: "**Версия:** {value}",
    replayMainInfo_4: "**Продолжительность:** {value}",
    replayMainInfo_5: "**Хост:** {value}",
    replayMainInfo_6: "**Игроки:**",
    replayMainInfo_7: "Ник",
    replayMainInfo_8: "Время в игре",
    replayMainInfo_9: "Код выхода",
    replayMainInfo_10: "Мне стало дальше лень парсить это все дело, так что добро пожаловать в GitHub",

    replayInfo_1: "Основная информация",
    replayInfo_2: "Чат",
    replayInfo_3: "Блоки",
    replayInfo_4: "W3MMD",

    nicknameColorPickerSelectColor: "Выберите цвет",
    nicknameColorPickerPreview: "Предпросмотр",
    nicknameColorPickerSaveColor: "Сохранить цвет",
} as const;

export default LanguageData;
