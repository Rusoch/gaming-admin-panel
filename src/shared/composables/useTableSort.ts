import { useState, useCallback } from "react";

export const useTableSort = (defaultSort = "-createdAt") => {
	const [sort, setSort] = useState(defaultSort);

	const handleSort = useCallback((column: string) => {
		setSort((currentSort) => {
			if (currentSort === column) return `-${column}`; 
			if (currentSort === `-${column}`) return column; 
			return column; 
		});
	}, []);

	return { sort, handleSort, setSort };
};
