interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Показывает состояние загрузки, блокирует кнопку и меняет текст на "Загрузка..." */
  loading?: boolean;
  /** Вариант стиля кнопки: primary (синий градиент) или secondary */
  variant?: 'primary' | 'secondary';
  /** Содержимое кнопки (текст или элементы) */
  children: React.ReactNode;
}

/**
 * Кнопка для submit форм с поддержкой loading состояния.
 * Использует существующие CSS классы btn-primary/btn-secondary.
 * 
 * @param loading - Блокирует кнопку и показывает "Загрузка..."
 * @param disabled - Стандартный HTML атрибут для отключения кнопки
 * @param className - Дополнительные CSS классы для кастомизации (например "w-full py-3")
 * @param ...props - Все остальные стандартные HTML атрибуты button (type, onClick, onBlur и т.д.)
 */
export function SubmitButton({ 
  loading, 
  variant = 'primary', 
  children, 
  disabled,
  className,
  ...props 
}: SubmitButtonProps) {
  const variantClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  
  return (
    <button
      disabled={disabled || loading}
      className={`${variantClass} ${className || ''}`}
      {...props}
    >
      {loading ? 'Загрузка...' : children}
    </button>
  );
}
