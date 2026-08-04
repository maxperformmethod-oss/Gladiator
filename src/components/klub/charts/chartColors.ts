/**
 * Kategorická paleta pre porovnávanie viacerých cvikov v jednom grafe.
 * Poradie je pevné a overené voči tmavému povrchu kariet: lightness band
 * aj chroma floor PASS, CVD adjacent ΔE nad hranicou, kontrast PASS.
 */
export const SERIES_COLORS = ['#BD75A7', '#CA4B2B', '#B98D27'] as const

/** Maximálny počet súčasne porovnávaných cvikov – limit daný čitateľnosťou aj paletou. */
export const MAX_COMPARE_EXERCISES = SERIES_COLORS.length
