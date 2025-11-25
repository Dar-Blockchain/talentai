export const formatNumber = (num: any) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'; // ← Use lowercase 'k'
    }
    return num.toString();
}

  export const calculateTaiTokens = (price: number) => {
    return price ? Math.floor(price * 1000) : 0;
  };

  export const stringToColor = (string: string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
  }
  
  export const stringAvatar = (name: string) => {
    const parts = name.trim().toUpperCase().split(" ");
    return {
      sx: { bgcolor: stringToColor(name) },
      children: `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`,
    };
  }