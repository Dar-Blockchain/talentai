'use client'

import React, { useState } from 'react';
import { 
  InputBase,
  Box,
  Typography,
  Tooltip,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

// Import popular Material-UI icons (same as IconSelector)
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import LanguageIcon from '@mui/icons-material/Language';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import CodeIcon from '@mui/icons-material/Code';
import WebIcon from '@mui/icons-material/Web';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import TelegramIcon from '@mui/icons-material/Telegram';
import DateRangeIcon from '@mui/icons-material/DateRange';
import EventIcon from '@mui/icons-material/Event';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedIcon from '@mui/icons-material/Verified';
import ApartmentIcon from '@mui/icons-material/Apartment';
import BusinessIcon from '@mui/icons-material/Business';
import GroupIcon from '@mui/icons-material/Group';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FolderIcon from '@mui/icons-material/Folder';
import BuildIcon from '@mui/icons-material/Build';
import SettingsIcon from '@mui/icons-material/Settings';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BookIcon from '@mui/icons-material/Book';
import PublicIcon from '@mui/icons-material/Public';
import TranslateIcon from '@mui/icons-material/Translate';
import PsychologyIcon from '@mui/icons-material/Psychology';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import BarChartIcon from '@mui/icons-material/BarChart';

// Import more Material-UI icons
import HomeIcon from '@mui/icons-material/Home';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import GridViewIcon from '@mui/icons-material/GridView';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AlarmIcon from '@mui/icons-material/Alarm';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MailIcon from '@mui/icons-material/Mail';
import ChatIcon from '@mui/icons-material/Chat';
import ForumIcon from '@mui/icons-material/Forum';
import CommentIcon from '@mui/icons-material/Comment';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import SecurityIcon from '@mui/icons-material/Security';
import ShieldIcon from '@mui/icons-material/Shield';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BadgeIcon from '@mui/icons-material/Badge';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import RecentActorsIcon from '@mui/icons-material/RecentActors';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import WalletIcon from '@mui/icons-material/Wallet';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import DiscountIcon from '@mui/icons-material/Discount';
import InventoryIcon from '@mui/icons-material/Inventory';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import FlightIcon from '@mui/icons-material/Flight';
import TrainIcon from '@mui/icons-material/Train';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import FitnessCenter from '@mui/icons-material/FitnessCenter';
import SportsIcon from '@mui/icons-material/Sports';
import SoccerIcon from '@mui/icons-material/Sports';
import BasketballIcon from '@mui/icons-material/SportsBasketball';
import TennisIcon from '@mui/icons-material/SportsTennis';
import GolfIcon from '@mui/icons-material/SportsGolf';
import MusicIcon from '@mui/icons-material/MusicNote';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeMuteIcon from '@mui/icons-material/VolumeMute';
import CameraIcon from '@mui/icons-material/Camera';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import VideocamIcon from '@mui/icons-material/Videocam';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import ImageIcon from '@mui/icons-material/Image';
import PaletteIcon from '@mui/icons-material/Palette';
import BrushIcon from '@mui/icons-material/Brush';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import EngineeringIcon from '@mui/icons-material/Engineering';
import ScienceIcon from '@mui/icons-material/Science';
import BiotechIcon from '@mui/icons-material/Biotech';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import PetsIcon from '@mui/icons-material/Pets';
import NatureIcon from '@mui/icons-material/Nature';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import HikingIcon from '@mui/icons-material/Hiking';
import CampingIcon from '@mui/icons-material/NaturePeople';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import CakeIcon from '@mui/icons-material/Cake';
import IcecreamIcon from '@mui/icons-material/Icecream';
import EmojiFoodBeverageIcon from '@mui/icons-material/EmojiFoodBeverage';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import DinnerDiningIcon from '@mui/icons-material/DinnerDining';
import LunchDiningIcon from '@mui/icons-material/LunchDining';
import BreakfastDiningIcon from '@mui/icons-material/BreakfastDining';
import KitchenIcon from '@mui/icons-material/Kitchen';
import MicrowaveIcon from '@mui/icons-material/Microwave';
import BlenderIcon from '@mui/icons-material/Blender';

// Define the list of icons with searchable labels
const icons = [
  // Contact & Communication
  { icon: EmailIcon, label: 'Email', category: 'contact' },
  { icon: PhoneIcon, label: 'Phone', category: 'contact' },
  { icon: LinkedInIcon, label: 'LinkedIn', category: 'social' },
  { icon: GitHubIcon, label: 'GitHub', category: 'social' },
  { icon: LanguageIcon, label: 'Language', category: 'contact' },
  { icon: LocationOnIcon, label: 'Location', category: 'contact' },
  { icon: WebIcon, label: 'Website', category: 'contact' },
  { icon: TwitterIcon, label: 'Twitter', category: 'social' },
  { icon: FacebookIcon, label: 'Facebook', category: 'social' },
  { icon: InstagramIcon, label: 'Instagram', category: 'social' },
  { icon: WhatsAppIcon, label: 'WhatsApp', category: 'contact' },
  { icon: TelegramIcon, label: 'Telegram', category: 'contact' },
  { icon: MailIcon, label: 'Mail', category: 'contact' },
  { icon: ChatIcon, label: 'Chat', category: 'communication' },
  { icon: ForumIcon, label: 'Forum', category: 'communication' },
  { icon: CommentIcon, label: 'Comment', category: 'communication' },
  
  // Personal & Professional
  { icon: PersonIcon, label: 'Person', category: 'personal' },
  { icon: AccountCircleIcon, label: 'Profile', category: 'personal' },
  { icon: BadgeIcon, label: 'Badge', category: 'personal' },
  { icon: ContactPageIcon, label: 'Contact Page', category: 'personal' },
  { icon: RecentActorsIcon, label: 'Contacts', category: 'personal' },
  { icon: WorkIcon, label: 'Work', category: 'career' },
  { icon: BusinessIcon, label: 'Business', category: 'career' },
  { icon: ApartmentIcon, label: 'Company', category: 'career' },
  { icon: GroupIcon, label: 'Team', category: 'career' },
  { icon: SupervisorAccountIcon, label: 'Management', category: 'career' },
  { icon: ManageAccountsIcon, label: 'Admin', category: 'career' },
  { icon: AdminPanelSettingsIcon, label: 'Admin Panel', category: 'career' },
  
  // Education & Skills
  { icon: SchoolIcon, label: 'Education', category: 'education' },
  { icon: MenuBookIcon, label: 'Textbook', category: 'education' },
  { icon: BookIcon, label: 'Book', category: 'education' },
  { icon: CodeIcon, label: 'Programming', category: 'skills' },
  { icon: BuildIcon, label: 'Tools', category: 'skills' },
  { icon: SettingsIcon, label: 'Settings', category: 'skills' },
  { icon: EngineeringIcon, label: 'Engineering', category: 'skills' },
  { icon: ArchitectureIcon, label: 'Architecture', category: 'skills' },
  { icon: DesignServicesIcon, label: 'Design', category: 'skills' },
  { icon: ScienceIcon, label: 'Science', category: 'skills' },
  { icon: BiotechIcon, label: 'Biotech', category: 'skills' },
  
  // Time & Events
  { icon: DateRangeIcon, label: 'Calendar', category: 'time' },
  { icon: EventIcon, label: 'Event', category: 'time' },
  { icon: CalendarTodayIcon, label: 'Today', category: 'time' },
  { icon: AccessTimeIcon, label: 'Time', category: 'time' },
  { icon: AlarmIcon, label: 'Alarm', category: 'time' },
  
  // Actions & Interface
  { icon: HomeIcon, label: 'Home', category: 'navigation' },
  { icon: AddIcon, label: 'Add', category: 'actions' },
  { icon: RemoveIcon, label: 'Remove', category: 'actions' },
  { icon: EditIcon, label: 'Edit', category: 'actions' },
  { icon: DeleteIcon, label: 'Delete', category: 'actions' },
  { icon: SaveIcon, label: 'Save', category: 'actions' },
  { icon: ShareIcon, label: 'Share', category: 'actions' },
  { icon: DownloadIcon, label: 'Download', category: 'actions' },
  { icon: UploadIcon, label: 'Upload', category: 'actions' },
  { icon: SearchIcon, label: 'Search', category: 'actions' },
  { icon: FilterListIcon, label: 'Filter', category: 'actions' },
  { icon: SortIcon, label: 'Sort', category: 'actions' },
  
  // Views & Display
  { icon: ViewListIcon, label: 'List View', category: 'display' },
  { icon: ViewModuleIcon, label: 'Grid View', category: 'display' },
  { icon: GridViewIcon, label: 'Grid', category: 'display' },
  { icon: VisibilityIcon, label: 'Show', category: 'display' },
  { icon: VisibilityOffIcon, label: 'Hide', category: 'display' },
  
  // Security & Verification
  { icon: LockIcon, label: 'Lock', category: 'security' },
  { icon: LockOpenIcon, label: 'Unlock', category: 'security' },
  { icon: SecurityIcon, label: 'Security', category: 'security' },
  { icon: ShieldIcon, label: 'Shield', category: 'security' },
  { icon: VerifiedUserIcon, label: 'Verified', category: 'security' },
  { icon: StarIcon, label: 'Star', category: 'rating' },
  { icon: CheckCircleIcon, label: 'Check', category: 'verification' },
  { icon: VerifiedIcon, label: 'Certified', category: 'verification' },
  { icon: ThumbUpIcon, label: 'Like', category: 'rating' },
  { icon: ThumbDownIcon, label: 'Dislike', category: 'rating' },
  
  // Analytics & Data
  { icon: DashboardIcon, label: 'Dashboard', category: 'analytics' },
  { icon: AnalyticsIcon, label: 'Analytics', category: 'analytics' },
  { icon: AssessmentIcon, label: 'Report', category: 'analytics' },
  { icon: AutoGraphIcon, label: 'Graph', category: 'analytics' },
  { icon: BarChartIcon, label: 'Chart', category: 'analytics' },
  { icon: TrendingUpIcon, label: 'Trending Up', category: 'analytics' },
  { icon: TrendingDownIcon, label: 'Trending Down', category: 'analytics' },
  
  // Files & Documents
  { icon: InsertDriveFileIcon, label: 'File', category: 'documents' },
  { icon: FolderIcon, label: 'Folder', category: 'documents' },
  { icon: DescriptionIcon, label: 'Document', category: 'documents' },
  { icon: AssignmentIcon, label: 'Assignment', category: 'documents' },
  
  // Finance & Business
  { icon: MonetizationOnIcon, label: 'Money', category: 'finance' },
  { icon: PaymentIcon, label: 'Payment', category: 'finance' },
  { icon: AccountBalanceIcon, label: 'Bank', category: 'finance' },
  { icon: CreditCardIcon, label: 'Credit Card', category: 'finance' },
  { icon: WalletIcon, label: 'Wallet', category: 'finance' },
  { icon: ShoppingCartIcon, label: 'Shopping', category: 'commerce' },
  { icon: StorefrontIcon, label: 'Store', category: 'commerce' },
  { icon: LocalOfferIcon, label: 'Offer', category: 'commerce' },
  { icon: DiscountIcon, label: 'Discount', category: 'commerce' },
  { icon: InventoryIcon, label: 'Inventory', category: 'commerce' },
  
  // Transportation & Travel
  { icon: FlightIcon, label: 'Flight', category: 'travel' },
  { icon: TrainIcon, label: 'Train', category: 'travel' },
  { icon: DirectionsCarIcon, label: 'Car', category: 'travel' },
  { icon: TwoWheelerIcon, label: 'Bike', category: 'travel' },
  { icon: DirectionsWalkIcon, label: 'Walk', category: 'travel' },
  { icon: DirectionsRunIcon, label: 'Run', category: 'travel' },
  { icon: DeliveryDiningIcon, label: 'Delivery', category: 'travel' },
  { icon: LocalShippingIcon, label: 'Shipping', category: 'travel' },
  
  // Sports & Fitness
  { icon: FitnessCenter, label: 'Fitness', category: 'sports' },
  { icon: SportsIcon, label: 'Sports', category: 'sports' },
  { icon: BasketballIcon, label: 'Basketball', category: 'sports' },
  { icon: TennisIcon, label: 'Tennis', category: 'sports' },
  { icon: GolfIcon, label: 'Golf', category: 'sports' },
  { icon: HikingIcon, label: 'Hiking', category: 'sports' },
  
  // Media & Entertainment
  { icon: MusicIcon, label: 'Music', category: 'media' },
  { icon: LibraryMusicIcon, label: 'Music Library', category: 'media' },
  { icon: HeadphonesIcon, label: 'Headphones', category: 'media' },
  { icon: PlayArrowIcon, label: 'Play', category: 'media' },
  { icon: PauseIcon, label: 'Pause', category: 'media' },
  { icon: StopIcon, label: 'Stop', category: 'media' },
  { icon: SkipNextIcon, label: 'Next', category: 'media' },
  { icon: SkipPreviousIcon, label: 'Previous', category: 'media' },
  { icon: VolumeUpIcon, label: 'Volume Up', category: 'media' },
  { icon: VolumeDownIcon, label: 'Volume Down', category: 'media' },
  { icon: VolumeMuteIcon, label: 'Mute', category: 'media' },
  { icon: CameraIcon, label: 'Camera', category: 'media' },
  { icon: PhotoCameraIcon, label: 'Photo', category: 'media' },
  { icon: VideocamIcon, label: 'Video', category: 'media' },
  { icon: PhotoLibraryIcon, label: 'Gallery', category: 'media' },
  { icon: ImageIcon, label: 'Image', category: 'media' },
  
  // Design & Creativity
  { icon: PaletteIcon, label: 'Palette', category: 'design' },
  { icon: BrushIcon, label: 'Brush', category: 'design' },
  { icon: FormatPaintIcon, label: 'Paint', category: 'design' },
  { icon: ColorLensIcon, label: 'Colors', category: 'design' },
  { icon: EmojiObjectsIcon, label: 'Ideas', category: 'creativity' },
  { icon: LightbulbIcon, label: 'Innovation', category: 'creativity' },
  
  // Health & Medical
  { icon: MedicalServicesIcon, label: 'Medical', category: 'health' },
  { icon: LocalHospitalIcon, label: 'Hospital', category: 'health' },
  { icon: HealthAndSafetyIcon, label: 'Health', category: 'health' },
  { icon: FavoriteIcon, label: 'Health', category: 'health' },
  
  // Nature & Environment
  { icon: PetsIcon, label: 'Pets', category: 'nature' },
  { icon: NatureIcon, label: 'Nature', category: 'nature' },
  { icon: EnergySavingsLeafIcon, label: 'Eco', category: 'nature' },
  { icon: AgricultureIcon, label: 'Agriculture', category: 'nature' },
  { icon: LocalFloristIcon, label: 'Flowers', category: 'nature' },
  { icon: WbSunnyIcon, label: 'Sun', category: 'weather' },
  { icon: CloudIcon, label: 'Cloud', category: 'weather' },
  { icon: ThunderstormIcon, label: 'Storm', category: 'weather' },
  { icon: AcUnitIcon, label: 'Snow', category: 'weather' },
  { icon: BeachAccessIcon, label: 'Beach', category: 'nature' },
  { icon: CampingIcon, label: 'Camping', category: 'nature' },
  
  // Food & Dining
  { icon: RestaurantIcon, label: 'Restaurant', category: 'food' },
  { icon: LocalCafeIcon, label: 'Coffee', category: 'food' },
  { icon: LocalBarIcon, label: 'Bar', category: 'food' },
  { icon: CakeIcon, label: 'Cake', category: 'food' },
  { icon: IcecreamIcon, label: 'Ice Cream', category: 'food' },
  { icon: EmojiFoodBeverageIcon, label: 'Beverage', category: 'food' },
  { icon: FastfoodIcon, label: 'Fast Food', category: 'food' },
  { icon: DinnerDiningIcon, label: 'Dinner', category: 'food' },
  { icon: LunchDiningIcon, label: 'Lunch', category: 'food' },
  { icon: BreakfastDiningIcon, label: 'Breakfast', category: 'food' },
  { icon: KitchenIcon, label: 'Kitchen', category: 'food' },
  { icon: MicrowaveIcon, label: 'Microwave', category: 'food' },
  { icon: BlenderIcon, label: 'Blender', category: 'food' },
  
  // Location & Geography
  { icon: PublicIcon, label: 'Global', category: 'location' },
  { icon: TranslateIcon, label: 'Translate', category: 'language' },
  { icon: PsychologyIcon, label: 'Psychology', category: 'skills' },
  
  // Notifications & Communication
  { icon: NotificationsIcon, label: 'Notifications', category: 'communication' },
];

type IconsSidebarProps = {
  onSelectIcon: (iconHtml: string) => void;
  onClose?: () => void;
};

export default function IconsSidebar({ onSelectIcon, onClose }: IconsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter icons based on search query
  const filteredIcons = icons.filter(icon => 
    icon.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    icon.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleIconSelect = (IconComponent: React.ElementType, label: string) => {
    // Create a mapping of icon names to SVG icons (same as IconSelector)
    const iconMap: Record<string, string> = {
      // Social Media with SVG icons
      'Twitter': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#1DA1F2">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>`,
      'Facebook': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#4267B2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>`,
      'Instagram': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#E1306C">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>`,
      'LinkedIn': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#0077b5">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>`,
      'GitHub': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#333">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>`,
      'Telegram': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#0088cc">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>`,
      
      // Contact & Communication icons
      'Email': '✉️',
      'Phone': '📞',
      'Location': '📍',
      'Website': '🌐',
      'Language': '🔤',
      'Mail': '📧',
      'Chat': '💬',
      'Forum': '🗣️',
      'Comment': '💭',
      
      // Personal & Professional
      'Person': '👤',
      'Profile': '👤',
      'Badge': '🏷️',
      'Contact Page': '📇',
      'Contacts': '👥',
      'Work': '💼',
      'Business': '🏢',
      'Company': '🏙️',
      'Team': '👥',
      'Management': '👔',
      'Admin': '⚙️',
      'Admin Panel': '🔧',
      
      // Time & Date
      'Calendar': '📅',
      'Event': '🗓️',
      'Today': '📅',
      'Time': '⏰',
      'Alarm': '⏰',
      
      // Actions & Interface
      'Home': '🏠',
      'Add': '➕',
      'Remove': '➖',
      'Edit': '✏️',
      'Delete': '🗑️',
      'Save': '💾',
      'Share': '↗️',
      'Download': '⬇️',
      'Upload': '⬆️',
      'Search': '🔍',
      'Filter': '🔽',
      'Sort': '🔄',
      
      // Views & Display
      'List View': '📋',
      'Grid View': '⚏',
      'Grid': '⚏',
      'Show': '👁️',
      'Hide': '🙈',
      
      // Security & Verification
      'Lock': '🔒',
      'Unlock': '🔓',
      'Security': '🛡️',
      'Shield': '🛡️',
      'Verified': '✅',
      'Star': '⭐',
      'Check': '✓',
      'Certified': '✅',
      'Like': '👍',
      'Dislike': '👎',
      
      // Analytics & Data
      'Dashboard': '📊',
      'Analytics': '📈',
      'Report': '📄',
      'Graph': '📊',
      'Chart': '📈',
      'Trending Up': '📈',
      'Trending Down': '📉',
      
      // Files & Documents
      'File': '📄',
      'Folder': '📁',
      'Document': '📝',
      'Assignment': '📋',
      
      // Finance & Business
      'Money': '💰',
      'Payment': '💳',
      'Bank': '🏦',
      'Credit Card': '💳',
      'Wallet': '👛',
      'Shopping': '🛒',
      'Store': '🏪',
      'Offer': '🏷️',
      'Discount': '💸',
      'Inventory': '📦',
      
      // Transportation & Travel
      'Flight': '✈️',
      'Train': '🚆',
      'Car': '🚗',
      'Bike': '🚲',
      'Walk': '🚶',
      'Run': '🏃',
      'Delivery': '🚚',
      'Shipping': '📦',
      
      // Sports & Fitness
      'Fitness': '💪',
      'Sports': '⚽',
      'Basketball': '🏀',
      'Tennis': '🎾',
      'Golf': '⛳',
      'Hiking': '🥾',
      
      // Media & Entertainment
      'Music': '🎵',
      'Music Library': '🎶',
      'Headphones': '🎧',
      'Play': '▶️',
      'Pause': '⏸️',
      'Stop': '⏹️',
      'Next': '⏭️',
      'Previous': '⏮️',
      'Volume Up': '🔊',
      'Volume Down': '🔉',
      'Mute': '🔇',
      'Camera': '📷',
      'Photo': '📸',
      'Video': '🎥',
      'Gallery': '🖼️',
      'Image': '🖼️',
      
      // Design & Creativity
      'Palette': '🎨',
      'Brush': '🖌️',
      'Paint': '🎨',
      'Colors': '🌈',
      'Ideas': '💡',
      'Innovation': '💡',
      
      // Health & Medical
      'Medical': '⚕️',
      'Hospital': '🏥',
      'Health': '❤️',
      
      // Nature & Environment
      'Pets': '🐕',
      'Nature': '🌿',
      'Eco': '🍃',
      'Agriculture': '🌾',
      'Flowers': '🌸',
      'Sun': '☀️',
      'Cloud': '☁️',
      'Storm': '⛈️',
      'Snow': '❄️',
      'Beach': '🏖️',
      'Camping': '🏕️',
      
      // Food & Dining
      'Restaurant': '🍽️',
      'Coffee': '☕',
      'Bar': '🍷',
      'Cake': '🎂',
      'Ice Cream': '🍦',
      'Beverage': '🥤',
      'Fast Food': '🍔',
      'Dinner': '🍽️',
      'Lunch': '🥪',
      'Breakfast': '🥞',
      'Kitchen': '🍳',
      'Microwave': '📡',
      'Blender': '🥤',
      
      // Location & Other
      'Global': '🌍',
      'Translate': '🔤',
      'Psychology': '🧠',
      'Notifications': '🔔',
      
      // Education & Skills
      'Education': '🎓',
      'Textbook': '📚',
      'Book': '📖',
      'Programming': '💻',
      'Tools': '🔧',
      'Settings': '⚙️',
      'Engineering': '🔧',
      'Architecture': '🏗️',
      'Design': '🎨',
      'Science': '🔬',
      'Biotech': '🧬',
    };

    const iconHtml = iconMap[label] || `<${label}Icon />`;
    onSelectIcon(iconHtml);
  };

  return (
    <>
      {/* Close Button */}
      {onClose && (
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: -16,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: '#ffffff',
            border: '2px solid #537AE3',
            borderRadius: '50%',
            width: 36,
            height: 36,
            boxShadow: '0 4px 12px rgba(83, 122, 227, 0.25)',
            zIndex: 1000,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: '#537AE3',
              borderColor: '#537AE3',
              boxShadow: '0 6px 16px rgba(83, 122, 227, 0.35)',
              transform: 'translateY(-50%) scale(1.1)'
            },
            '&:hover .close-icon': {
              color: '#ffffff'
            }
          }}
        >
          <ChevronLeftIcon 
            className="close-icon"
            sx={{ 
              color: '#537AE3', 
              fontSize: '18px',
              transition: 'color 0.2s ease'
            }} 
          />
        </IconButton>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ 
          color: '#333',
          fontWeight: 600,
          mb: 1
        }}>
          Icons
        </Typography>
        <Typography variant="body2" sx={{ 
          color: 'rgba(51,51,51,0.7)',
          fontSize: '0.875rem',
          mb: 2
        }}>
          Click any icon to add it to your resume
        </Typography>

        {/* Search Bar */}
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'rgba(51,51,51,0.05)',
          borderRadius: '8px',
          px: 2,
          py: 1,
          mb: 3
        }}>
          <SearchIcon sx={{ color: 'rgba(51,51,51,0.5)', mr: 1 }} />
          <InputBase
            placeholder="Search icons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              flex: 1,
              fontSize: '0.875rem',
              color: '#333',
              '& input::placeholder': {
                color: 'rgba(51,51,51,0.5)',
                opacity: 1
              }
            }}
          />
        </Box>
      </Box>

      {/* Icons Grid */}
      <Box 
        sx={{ 
          height: 'calc(100vh - 200px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          pr: 1,
          // Completely isolate scrolling
          isolation: 'isolate',
          contain: 'layout style paint',
          // Custom scrollbar styling for blue theme
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(83, 122, 227, 0.1)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(90deg, #537AE3 0%, #5D3BDB 100%)',
            borderRadius: '4px',
            '&:hover': {
              background: 'linear-gradient(90deg, #4A6ED7 0%, #5235C7 100%)',
            }
          }
        }}
        onWheel={(e) => {
          // Completely prevent scroll from affecting parent
          e.stopPropagation();
          
          const container = e.currentTarget;
          const { scrollTop, scrollHeight, clientHeight } = container;
          const isAtTop = scrollTop === 0;
          const isAtBottom = scrollTop >= scrollHeight - clientHeight - 1;
          
          // Always handle scroll within container
          if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
            // At boundary - prevent default to stop page scroll
            e.preventDefault();
          }
        }}
        onScroll={(e) => {
          // Prevent scroll events from bubbling
          e.stopPropagation();
        }}
        onTouchMove={(e) => {
          // Prevent touch scroll from affecting parent
          e.stopPropagation();
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1.5,
            // Completely prevent horizontal overflow
            maxWidth: '100%',
            width: '100%',
            boxSizing: 'border-box',
            // Prevent layout shifts
            contain: 'layout'
          }}
        >
          {filteredIcons.map(({ icon: Icon, label }, index) => (
            <Box 
              key={index} 
              sx={{ 
                width: { xs: 'calc(50% - 6px)', sm: 'calc(33.333% - 8px)' },
                mb: 1.5,
                // Prevent any horizontal overflow
                maxWidth: { xs: 'calc(50% - 6px)', sm: 'calc(33.333% - 8px)' },
                minWidth: 0,
                boxSizing: 'border-box'
              }}
            >
              <Tooltip title={label} placement="top" arrow>
                <Box
                  onClick={() => handleIconSelect(Icon, label)}
                  onMouseEnter={(e) => {
                    // Prevent any scroll events during hover
                    e.stopPropagation();
                  }}
                  onMouseMove={(e) => {
                    // Prevent mouse move from affecting scroll
                    e.stopPropagation();
                  }}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 1.5,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: 'rgba(51,51,51,0.02)',
                    border: '1px solid rgba(51,51,51,0.1)',
                    transition: 'all 0.15s ease',
                    minHeight: '72px',
                    maxHeight: '72px', // Fixed height to prevent layout shifts
                    position: 'relative',
                    // Completely prevent overflow and layout shifts
                    overflow: 'hidden',
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                    // Optimize for hover performance
                    willChange: 'background-color, border-color, box-shadow',
                    // Prevent transform to avoid layout shifts
                    '&:hover': {
                      backgroundColor: 'rgba(83, 122, 227, 0.1)',
                      borderColor: '#537AE3',
                      boxShadow: '0 2px 8px rgba(83, 122, 227, 0.15)',
                      // Remove transform to prevent any movement
                      zIndex: 1
                    }
                  }}
                >
                  <Icon sx={{ 
                    fontSize: '22px',
                    color: '#537AE3',
                    mb: 0.5,
                    // Prevent icon from affecting layout
                    flexShrink: 0
                  }} />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'rgba(51,51,51,0.8)',
                      fontSize: '0.7rem',
                      textAlign: 'center',
                      lineHeight: 1.1,
                      wordBreak: 'break-word',
                      hyphens: 'auto',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      // Fixed height to prevent layout shifts
                      height: '28px',
                      flexShrink: 0
                    }}
                  >
                    {label}
                  </Typography>
                </Box>
              </Tooltip>
            </Box>
          ))}
        </Box>

        {filteredIcons.length === 0 && (
          <Box sx={{ 
            textAlign: 'center',
            py: 4
          }}>
            <Typography variant="body2" sx={{ 
              color: 'rgba(51,51,51,0.5)',
              fontStyle: 'italic'
            }}>
              No icons found matching "{searchQuery}"
            </Typography>
          </Box>
        )}
      </Box>
    </>
  );
} 