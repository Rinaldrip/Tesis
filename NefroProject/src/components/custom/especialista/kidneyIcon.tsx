interface KidneyIconProps {
    className?: string;
}

export default function KidneyIcon({ className = 'w-8 h-8' }: KidneyIconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12 3C9.5 3 7.5 4.5 6.5 6.5C5.5 8.5 5 11 5 13C5 15.5 5.5 17.5 6.5 19C7.5 20.5 9 21.5 11 21.5C12.5 21.5 13.5 20.5 14 19C14.5 17.5 14.5 15.5 14.5 13.5C14.5 12 14.8 10.5 15.5 9.5C16.2 8.5 17 8 18 8C19 8 19.8 8.5 20.5 9.5C21.2 10.5 21.5 12 21.5 13.5C21.5 15.5 21 17.5 20 19C19 20.5 17.5 21.5 15.5 21.5" />
            <ellipse cx="10" cy="13" rx="2" ry="3" fill="currentColor" opacity="0.3" />
        </svg>
    );
}
