export interface Partner {
  name: string;
  logo: string;
  description: string;
  category: string;
  isImage?: boolean;
}

export const partners: Partner[] = [
  {
    name: "Hgraph",
    logo: "/hashgraph.png",
    description: "Decentralized Graph Database Solutions",
    category: "Blockchain",
    isImage: true
  },
  {
    name: "Hedera",
    logo: "/hedera.png",
    description: "Enterprise-Grade Public Network",
    category: "Blockchain",
    isImage: true

  },
  {
    name: "DarBlockchain",
    logo: "/Darblockchain.png",
    description: "Innovative Blockchain Solutions",
    category: "Blockchain",
    isImage: true
  },
  {
    name: "Lightency",
    logo: "/lightency.png",
    description: "Smart Energy Solutions",
    category: "Blockchain",
    isImage: true
  }
]; 