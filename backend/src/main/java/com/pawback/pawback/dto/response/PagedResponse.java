package com.pawback.pawback.dto.response;

import lombok.Builder;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Slim, stable pagination envelope for list endpoints.
 *
 * Spring Data's own Page serialises with an unstable JSON shape (and logs a
 * warning about it), so admin list endpoints wrap their results in this instead —
 * the frontend only needs the rows plus enough metadata to render page controls.
 */
@Getter
@Builder
public class PagedResponse<T> {

    private final List<T> content;
    private final int page;
    private final int size;
    private final long totalElements;
    private final int totalPages;
    private final boolean last;

    public static <T> PagedResponse<T> from(Page<T> page) {
        return PagedResponse.<T>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
