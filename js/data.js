window.ARCAN_DEFAULT_DATA = {
  config: {
    storeName: "ArcanStore",
    bsRate: 45.5,
    adminPassword: "arcan2026",
    backgroundUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80",
    overlayOpacity: 0.82,
    bgBlur: 4,
    accentColor: "#00e5ff"
  },

  backgroundPresets: [
    {
      name: "Cyber Arena",
      url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80"
    },
    {
      name: "Neón Púrpura",
      url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80"
    },
    {
      name: "Setup Oscuro",
      url: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1600&q=80"
    },
    {
      name: "Fondo Sólido",
      url: ""
    }
  ],

  payments: [
    {
      id: "pagomovil",
      name: "Pago Móvil",
      currency: "VES",
      details: "Banco: Mercantil (0105)\nTeléfono: 0414-0000000\nCédula: V-28.000.000",
      active: true
    },
    {
      id: "zinli",
      name: "Zinli",
      currency: "USD",
      details: "Correo Zinli: pagos@arcanstore.com\nTitular: ArcanStore",
      active: true
    },
    {
      id: "paypal",
      name: "PayPal",
      currency: "USD",
      details: "Correo PayPal: pagos@arcanstore.com\nNota: Enviar sin dirección física",
      active: true
    },
    {
      id: "binance",
      name: "Binance Pay",
      currency: "USD",
      details: "Binance ID: 123456789\nCorreo: binance@arcanstore.com\nMoneda: USDT",
      active: true
    }
  ],

  games: [
    {
      id: "mlbb",
      name: "Mobile Legends",
      subtitle: "Bang Bang • Diamantes Directos",
      tag: "POPULAR",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
      needsZone: true,
      idLabel: "User ID",
      zoneLabel: "Zone ID",
      packages: [
        { id: "ml1", name: "86 Diamantes", priceUsd: 1.80, image: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=300&q=80" },
        { id: "ml2", name: "172 Diamantes", priceUsd: 3.50, image: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=300&q=80" },
        { id: "ml3", name: "257 Diamantes", priceUsd: 5.20, image: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=300&q=80" },
        { id: "ml4", name: "Pase Semanal", priceUsd: 2.20, image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80" }
      ]
    },
    {
      id: "freefire",
      name: "Free Fire",
      subtitle: "Garena • Diamantes por ID",
      tag: "TOP VENTAS",
      image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80",
      needsZone: false,
      idLabel: "ID de Jugador",
      zoneLabel: "",
      packages: [
        { id: "ff1", name: "100 + 10 Diamantes", priceUsd: 1.20, image: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=300&q=80" },
        { id: "ff2", name: "310 + 31 Diamantes", priceUsd: 3.40, image: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=300&q=80" },
        { id: "ff3", name: "520 + 52 Diamantes", priceUsd: 5.50, image: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=300&q=80" },
        { id: "ff4", name: "Tarjeta Semanal", priceUsd: 2.10, image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80" }
      ]
    },
    {
      id: "codm",
      name: "COD Mobile",
      subtitle: "Activision • CP Oficiales",
      tag: "RÁPIDO",
      image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=800&q=80",
      needsZone: false,
      idLabel: "UID de Jugador",
      zoneLabel: "",
      packages: [
        { id: "cod1", name: "80 CP", priceUsd: 1.30, image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80" },
        { id: "cod2", name: "420 CP", priceUsd: 5.40, image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80" },
        { id: "cod3", name: "880 CP", priceUsd: 10.50, image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80" }
      ]
    },
    {
      id: "bloodstrike",
      name: "Blood Strike",
      subtitle: "NetEase • Oro Directo",
      tag: "NUEVO",
      image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
      needsZone: false,
      idLabel: "ID de Jugador",
      zoneLabel: "",
      packages: [
        { id: "bs1", name: "100 Oro", priceUsd: 1.25, image: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=300&q=80" },
        { id: "bs2", name: "300 + 20 Oro", priceUsd: 3.60, image: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=300&q=80" },
        { id: "bs3", name: "500 + 40 Oro", priceUsd: 5.80, image: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=300&q=80" }
      ]
    },
    {
      id: "roblox",
      name: "Roblox",
      subtitle: "Tarjetas & Robux",
      tag: "FAVORITO",
      image: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=800&q=80",
      needsZone: false,
      idLabel: "Usuario de Roblox",
      zoneLabel: "",
      packages: [
        { id: "rb1", name: "400 Robux", priceUsd: 5.50, image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80" },
        { id: "rb2", name: "800 Robux", priceUsd: 10.50, image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80" },
        { id: "rb3", name: "1700 Robux", priceUsd: 21.00, image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80" }
      ]
    }
  ],

  orders: []
};
