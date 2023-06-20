export interface Lang {
  siteLoading: string;
  siteErrorCatch: string;
  closeOauthWindow: string;
  error: string;
  loginError: string;
  loginErrorSessionExpired: string;
  onlineStatsCategory: string;
  onlineStatsTotalGame: string;
  onlineStatsPlayers: string;
  chatListConsoleBotTitle: string;
  chatListConsoleBotInfo: string;
  chatListNicknamePlaceholder: string;
  chatListOpenChat: string;

  chat: {
    chat: string;
    console: string;
    consoleSend: string;
    you: string;
    send: string;
  };

  menu: {
    gamelist: string;
    maplist: string;
    help: string;
    donate: string;
    changeTheme: string;

    user: {
      create: string;
      settings: string;
      accessList: string;
      logout: string;
      login: string;
    };

    utils: {
      utils: string;
      autohostList: string;
      accessMask: string;
      mapUploading: string;
    };

    map: {
      notUploading: string;
      uploading: string;
      isUploaded: string;
      map: string;
      isUploaded2: string;
      error: string;
    };
  };

  footer: {
    connected: string;
    hostbot: string;
  };

  page: {
    nf404: string;
    loading: string;
    tomain: string;

    replay: {
      parser: {
        block: string;
        actionLog: {
          toBegin: string;
          nonEmpty: string;
          syncIntegerOnly: string;
          chatCommandOnly: string;
          loadTopBlocks: string;
          "loadBottomBlocks:": string;
        };
        external: {
          after: string;
          empty: string;
          cmdFrom: string;
          unknownActs: string;
        };
      };
      open: {
        insert: string;
        open: string;
        or: string;
        file: string;
      };
      info: {
        base: string;
        chat: string;
        blocks: string;

        map: {
          base: string;
          gamename: string;
          version: string;
          duration: string;
          host: string;
          players: string;
          nickname: string;
          gametime: string;
          exitcode: string;
          aqua: string;
        };
      };
    };

    edit: {
      config: {
        saved: string;
        savingError: string;
        loading: string;
        madeFor: string;
        name: string;
        save: string;
        json: string;
      };
    };

    forbidden: {
      thisPage: string;
      wait: string;
      authorization: string;
      connecting: string;
      denied: string;
      norights: string;
      main: string;
    };

    autopay: {
      place: {
        vip: string;
        banList: string;
        adminList: string;
        autohost: string;
      };

      donute: string;
      donuteNotSelected: string;
      needMark: string;
      incorrectedID: string;
      incorrectedIDEx: string;

      payhere: string;
      donuteCalc: string;
      yourID: string;
      duration: string;
      totalCost: string;
      paycard: string;
      pcYoo: string;

      infoA: string;
      infoB: string;
      infoC: string;

      paying: string;
      payirka: string;
    };

    map: {
      catalog: string;
      maps: string;
      loading: string;
      lconfig: string;
      snparsed: string;

      info: {
        loading: string;
        hasError: string;
        qplayers: string;
      };

      config: {
        edit: string;
        gameslots: string;
        observerslots: string;
      };

      selectTab: {
        filters: string;
        mapSearch: string;
        mapSearchPlaceholder: string;
        select: string;
        loadingZZZ: string;
        loadMore: string;
      };

      status: {
        icon: {
          favour: string;
          verified: string;
          cheatPack: string;
          semnaticError: string;
        };
      };

      cloneConfing: {
        error: string;
        copyError: string;
        buttonClone: string;
        modal: {
          caption: string;
          version: string;
          standardCfg: string;
          nameCfg: string;
          tocopy: string;
        };
      };

      button: {
        favour: {
          error: string;
        };

        gameJoin: string;
        download: string;
      };

      flags: {
        hasCheatPack: string;
        scriptHasSemanticErrors: string;
        statsType: string;
        hclSupport: string;
      };

      header: {
        author: string;
        playerRecommendation: string;
        uploadedFileName: string;
        fileNameOnBot: string;
      };

      slots: {
        type: {
          open: string;
          closed: string;
          aiEasy: string;
          aiMedium: string;
          aiInsane: string;
        };

        race: {
          human: string;
          orc: string;
          nightelf: string;
          undead: string;
          random: string;
        };

        force: string;

        slot: {
          type: string;
          team: string;
          race: string;
          teamcolor: string;
          handicap: string;
        };
      };

      stats: {
        allPlayers: string;
        lobbyPlayers: string;
      };

      slotsEdit: {
        allowChange: string;
      };

      list: {
        maps: string;
        watch: string;
        filters: string;
        limitedSearching: string;
        list: string;
        searching: string;
        inputName: string;
        loading: string;
        loadYet: string;

        card: {
          allText: string;
        };
        filter: {
          options: {
            sort: {
              default: string;
              name: string;
              creationData: string;
              updateDate: string;
              numPlayers: string;
            };
            order: {
              default: string;
              asc: string;
              desc: string;
            };

            any: string;
          };
          form: {
            label: {
              freeSlots: string;
              sortBy: string;
              orderBy: string;
              category: string;
              owner: string;
            };
            checkbox: {
              verifiedOnly: string;
              taggedOnly: string;
              favoriteOnly: string;
            };
            button: {
              accept: string;
              reset: string;
            };
          };
        };
      };
      edit: {
        flagsBlock: {
          canDownload: string;
          lock: string;
          imagesAvailable: string;
          isVerified: string;
          category: string;
          phCategory: string;
          tag: string;
          tosave: string;
        };

        informer: string;
        flagLoads: string;
        xdesc: string;
        description: string;

        xdescription: {
          save: string;
          preview: string;
          previews: string;
        };

        loading: string;
      };
    };

    game: {
      create: {
        tab: {
          creation: string;
          creationEx: string;
          map: string;
          config: string;
        };

        confirm: {
          pathNotification: {
            error: string;
            configuring: string;
            incompatibleVersion: string;
          };

          new: string;
          loadingZZZ: string;
          name: string;
          patch: string;
          create: string;
          autohost: string;
          passgame: string;
          passgameInfo: string;
          copy: string;
          close: string;

          useLocal: {
            MapCategories: {
              errorParam: string;
            };
            autohostCreateCallback: {
              isCreated: string;
              isNotCreated: string;
              mapErrorParam: string;
            };
            CreateGameCallback: {
              isCreated: string;
              useConnector: string;
              isError: string;
              isMapError: string;
            };
          };
        };
      };

      options: {
        visibility: {
          default: string;
          masked: string;
          explored: string;
          open: string;
        };
        gamespeed: {
          slow: string;
          norm: string;
          fast: string;
        };
        observers: {
          none: string;
          all: string;
          after: string;
          referees: string;
        };

        needPassword: string;
        configName: string;
        teamsTogether: string;
        fixedTeams: string;
        unitShare: string;
        randomRaces: string;
        randomHero: string;
        mapObservers: string;
        map: string;
        speed: string;
      };

      list: {
        list: string;
        watch: string;
        fastfilter: string;
        howToPlay: string;

        button: {
          add: {
            private: string;
            password: string;
            login: string;
          };
        };
        filter: {
          options: {
            default: string;
            freeSlots: string;
            allSlots: string;
            playerSlots: string;
          };
          noLoadStarted: string;
          forceReorder: string;
          onlySelfGames: string;
          onlyFavoritedMaps: string;
          gameType: string;
          allType: string;
          reposeType: string;
          lobbyPlayers: string;
          freeSlots: string;
          slots: string;
        };

        playerItem: {
          renderStats: {
            undefined: string;
            null: string;
          };
          wins: string;
          defeats: string;
          winrate: string;
          totalTime: string;
          h: string;
          writeMessage: string;
        };

        index: {
          slots: string;
          game: string;
          version: string;
          players: string;
          owner: string;
          copy: string;
        };
      };
    };
  };

  modal: {
    accessList: {
      caption: string;
      norights: string;
      info: string;
      table: {
        playerID: string;
        accessMask: string;
        expires: string;
        indefinitely: string;
      };
    };

    accessMask: {
      caption: string;
      checkbox: {
        vipCommands: string;
        manageConfig: string;
        manageGame: string;
        managePlayers: string;
        manageAutohost: string;
        gameCreate: string;
        vipJoin: string;
        gamePowerUp: string;
        gameLimitedAdmins: string;
        scopeSettings: string;
        adminAccessBanAdd: string;
        adminAccessBanRemove: string;
        adminAccessBanList: string;
        adminAccessAdminAdd: string;
        adminAccessAdminRemove: string;
        adminAccessAdminList: string;
        accessShare: string;
        accessGlobal: string;
        accessRoot: string;
      };
      add3in1: string;
      addBanList: string;
      addAdminList: string;
      save: string;
    };

    autohostList: {
      toast: {
        deletingError: string;
        deletingErrorReason: string;
      };

      caption: string;
      isLoading: string;
      isEmpty: string;

      table: {
        name: string;
        autostart: string;
        gamelimit: string;
        gamecreated: string;
        owner: string;
        actions: string;
      };
    };

    connectorSummary: {
      caption: string;
      description: string;
      removeall: string;
      notAddedAnyGamesYet: string;
      connectorNotRunning: string;
    };

    createAutohost: {
      caption: string;
      description: string;

      label: {
        gamename: string;
        autostart: string;
        gamelimit: string;
        hcl: string;
      };

      placeholder: {
        gamename: string;
        autostart: string;
        gamelimit: string;
        hcl: string;
      };

      tocreate: string;
    };

    dragAndDropField: string;

    gameListFilter: {
      caption: string;
    };

    mapReport: {
      caption: string;
      type: string;
      info: string;
      source: string;
      comment: string;
      tosend: string;

      options: {
        defaulth: string;
        verify: string;
        errorCheatPackDetector: string;
        errorCategory: string;
      };

      send: {
        type: string;
        link: string;
        source: string;
        comment: string;
      };
    };

    mapUploader: {
      chooseMap: string;
      whichUploadLabel: string;
      whichUploadHint: string;
      categoryLabel: string;
      category: string;
      loading: string;
      beforeLoading: string;
      loadingHint: string;
    };

    uploading: {
      caption: string;
      description: string;
      uploaded: string;
    };

    register: {
      caption: string;
      description: string;
      yes: string;
      no: string;
    };

    settings: {
      caption: string;
      connection: string;
      linkingPVPGn: string;
      linkingPVPGnHint: string;
      save: string;
      error: string;
    };

    sendSignal: {
      send: string;
      what: string;
      sign: string;
      cancel: string;
      submit: string;
    };
  };

  other: {
    config: {
      preview: string;
      selectTAB: {
        removeError: string;
        loading: string;
        update: string;
        tomap: string;
        choose: string;
        edit: string;
        delete: string;
        noconfig: string;
      };
    };
  };
}
