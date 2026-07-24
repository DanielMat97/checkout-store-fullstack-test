/** Colombia flag + dial code for phone fields. */
export function ColombiaFlag() {
  return (
    <span className="nora-co-flag" aria-hidden="true" title="Colombia (+57)">
      <svg viewBox="0 0 9 6" width="22" height="15" focusable="false">
        <rect width="9" height="6" fill="#FCD116" />
        <rect y="3" width="9" height="1.5" fill="#003893" />
        <rect y="4.5" width="9" height="1.5" fill="#CE1126" />
      </svg>
      <span className="nora-co-flag__code">+57</span>
    </span>
  );
}
